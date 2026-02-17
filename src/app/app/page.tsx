"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCard, type EventCardEvent } from "@/components/event-card";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  SearchX,
  MapPin,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

type DateWindow = "today" | "weekend" | "week" | "all";
type IndoorOutdoorFilter = "all" | "INDOOR" | "OUTDOOR" | "MIXED";

const CATEGORY_OPTIONS = [
  { value: "WALK", label: "Walk" },
  { value: "PLAYGROUND", label: "Playground" },
  { value: "LIBRARY", label: "Library" },
  { value: "CRAFTS", label: "Crafts" },
  { value: "SPORTS", label: "Sports" },
  { value: "OTHER", label: "Other" },
];

function getDateRange(window: DateWindow): {
  startAfter?: string;
  startBefore?: string;
} {
  const now = new Date();

  switch (window) {
    case "today": {
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return {
        startAfter: now.toISOString(),
        startBefore: endOfDay.toISOString(),
      };
    }
    case "weekend": {
      const dayOfWeek = now.getDay();
      // Find next Saturday (or today if already Saturday)
      const daysUntilSat = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + daysUntilSat);
      saturday.setHours(0, 0, 0, 0);

      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59, 999);

      return {
        startAfter: now.toISOString(),
        startBefore: sunday.toISOString(),
      };
    }
    case "week": {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      nextWeek.setHours(23, 59, 59, 999);
      return {
        startAfter: now.toISOString(),
        startBefore: nextWeek.toISOString(),
      };
    }
    case "all":
    default:
      return { startAfter: now.toISOString() };
  }
}

function SkeletonCard() {
  return (
    <Card className="rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded bg-muted" />
              <div className="h-5 w-16 rounded bg-muted" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-1/3 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FeedPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState("nearby");

  // Filter state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateWindow, setDateWindow] = useState<DateWindow>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [indoorOutdoor, setIndoorOutdoor] =
    useState<IndoorOutdoorFilter>("all");
  const [screenLightOnly, setScreenLightOnly] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(10);

  // Data state
  const [events, setEvents] = useState<EventCardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  // Fetch user profile for location defaults
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          const profile = data.user?.profile || data.profile;
          if (profile) {
            setUserLat(profile.lat);
            setUserLng(profile.lng);
            setRadiusMiles(profile.radiusMiles || 10);
          }
        }
      } catch {
        // Fallback: user location not available
      }
    }
    fetchProfile();
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (userLat === null || userLng === null) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("lat", String(userLat));
      params.set("lng", String(userLng));
      params.set("radiusMiles", String(radiusMiles));
      params.set("tab", activeTab);

      // Date range
      const { startAfter, startBefore } = getDateRange(dateWindow);
      if (startAfter) params.set("startAfter", startAfter);
      if (startBefore) params.set("startBefore", startBefore);

      // Categories - send first selected if any (API takes single category)
      if (selectedCategories.length === 1) {
        params.set("category", selectedCategories[0]);
      }

      // Indoor/Outdoor
      if (indoorOutdoor !== "all") {
        params.set("indoorOutdoor", indoorOutdoor);
      }

      // Screen-light
      if (screenLightOnly) {
        params.set("noDevices", "true");
      }

      const res = await fetch(`/api/events?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await res.json();
      let eventList: EventCardEvent[] = data.events || [];

      // Client-side multi-category filter if more than one selected
      if (selectedCategories.length > 1) {
        eventList = eventList.filter((e) =>
          selectedCategories.includes(e.category)
        );
      }

      setEvents(eventList);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    userLat,
    userLng,
    radiusMiles,
    activeTab,
    dateWindow,
    selectedCategories,
    indoorOutdoor,
    screenLightOnly,
    toast,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  const feedContent = (
    <>
      {/* Filter bar */}
      <div className="border-b border-border bg-card">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Filters</span>
          {filtersOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {filtersOpen && (
          <div className="space-y-4 px-4 pb-4">
            {/* Date window */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">When</Label>
              <Select
                value={dateWindow}
                onValueChange={(v) => setDateWindow(v as DateWindow)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="weekend">This Weekend</SelectItem>
                  <SelectItem value="week">Next 7 Days</SelectItem>
                  <SelectItem value="all">All Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category checkboxes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Categories</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORY_OPTIONS.map((cat) => (
                  <label
                    key={cat.value}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedCategories.includes(cat.value)}
                      onCheckedChange={() => toggleCategory(cat.value)}
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Indoor/Outdoor */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Indoor / Outdoor</Label>
              <Select
                value={indoorOutdoor}
                onValueChange={(v) =>
                  setIndoorOutdoor(v as IndoorOutdoorFilter)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="INDOOR">Indoor</SelectItem>
                  <SelectItem value="OUTDOOR">Outdoor</SelectItem>
                  <SelectItem value="MIXED">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Screen-light switch */}
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Screen-light only
              </Label>
              <Switch
                checked={screenLightOnly}
                onCheckedChange={setScreenLightOnly}
              />
            </div>

            {/* Radius slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Radius</Label>
                <span className="text-xs text-muted-foreground">
                  {radiusMiles} mi
                </span>
              </div>
              <Slider
                value={[radiusMiles]}
                onValueChange={(v) => setRadiusMiles(v[0])}
                min={1}
                max={25}
                step={1}
              />
            </div>
          </div>
        )}
      </div>

      {/* Event list */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No events found nearby
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Try widening your search radius, adjusting your filters, or
              creating an event for your community.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRadiusMiles(Math.min(radiusMiles + 5, 25));
                }}
              >
                <MapPin className="mr-1.5 h-4 w-4" />
                Widen Radius
              </Button>
              <Button size="sm" asChild>
                <Link href="/app/events/create">
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-6">
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover activities happening in your community
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-4"
      >
        <div className="px-4 sm:px-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="nearby" className="flex-1 sm:flex-none">
              Nearby
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex-1 sm:flex-none">
              Popular
            </TabsTrigger>
            <TabsTrigger value="foryou" className="flex-1 sm:flex-none">
              For You
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All tabs share the same content since filtering is done via API */}
        <TabsContent value="nearby">{feedContent}</TabsContent>
        <TabsContent value="popular">{feedContent}</TabsContent>
        <TabsContent value="foryou">{feedContent}</TabsContent>
      </Tabs>
    </div>
  );
}
