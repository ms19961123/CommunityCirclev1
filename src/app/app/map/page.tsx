"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Loader2,
  TreePine,
  Sun,
  BookOpen,
  Palette,
  Trophy,
  Sparkles,
  Calendar,
  Users,
  ChevronRight,
} from "lucide-react";

const CATEGORIES: Record<
  string,
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  WALK: { icon: TreePine, label: "Walk", color: "text-teal-600", bg: "bg-teal-50" },
  PLAYGROUND: { icon: Sun, label: "Playground", color: "text-amber-600", bg: "bg-amber-50" },
  LIBRARY: { icon: BookOpen, label: "Library", color: "text-blue-600", bg: "bg-blue-50" },
  CRAFTS: { icon: Palette, label: "Crafts", color: "text-orange-600", bg: "bg-orange-50" },
  SPORTS: { icon: Trophy, label: "Sports", color: "text-emerald-600", bg: "bg-emerald-50" },
  OTHER: { icon: Sparkles, label: "Other", color: "text-gray-600", bg: "bg-gray-50" },
};

// Neighborhood tiles as a fallback for no map key
const NEIGHBORHOODS = [
  { name: "Rittenhouse Square", lat: 39.9496, lng: -75.172 },
  { name: "Center City", lat: 39.9526, lng: -75.1652 },
  { name: "University City", lat: 39.9522, lng: -75.1932 },
  { name: "Old City", lat: 39.9526, lng: -75.1422 },
  { name: "Fishtown", lat: 39.9735, lng: -75.1337 },
  { name: "Fairmount", lat: 39.9682, lng: -75.1727 },
  { name: "South Philly", lat: 39.9284, lng: -75.1597 },
  { name: "Manayunk", lat: 40.0265, lng: -75.2243 },
  { name: "Chestnut Hill", lat: 40.0738, lng: -75.2086 },
];

interface EventPreview {
  id: string;
  title: string;
  category: string;
  startAt: string;
  locationLabelPublic: string;
  _count: { rsvps: number };
  maxAttendees: number;
}

export default function MapPage() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [events, setEvents] = useState<EventPreview[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadEventsForNeighborhood(lat: number, lng: number) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/events?lat=${lat}&lng=${lng}&radiusMiles=2`
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : data.events || []);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectNeighborhood(hood: (typeof NEIGHBORHOODS)[0]) {
    setSelectedNeighborhood(hood.name);
    loadEventsForNeighborhood(hood.lat, hood.lng);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Explore Neighborhoods</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap a neighborhood to see upcoming events nearby.
        </p>
      </div>

      {/* Neighborhood Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {NEIGHBORHOODS.map((hood) => (
          <button
            key={hood.name}
            onClick={() => handleSelectNeighborhood(hood)}
            className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
              selectedNeighborhood === hood.name
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div
              className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                selectedNeighborhood === hood.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold">{hood.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hood.lat.toFixed(2)}, {hood.lng.toFixed(2)}
            </p>
          </button>
        ))}
      </div>

      {/* Selected Neighborhood Events */}
      {selectedNeighborhood && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Events near {selectedNeighborhood}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="py-10 text-center">
                <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-medium">No events in this area yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first to host one!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/app/events/create">Create Event</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const cat = CATEGORIES[event.category] || CATEGORIES.OTHER;
                const Icon = cat.icon;
                return (
                  <Link key={event.id} href={`/app/events/${event.id}`}>
                    <Card className="rounded-2xl transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cat.bg}`}
                        >
                          <Icon className={`h-5 w-5 ${cat.color}`} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="truncate font-medium">{event.title}</h3>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.startAt).toLocaleDateString([], {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.locationLabelPublic}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {event._count.rsvps}/{event.maxAttendees}
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!selectedNeighborhood && (
        <Card className="rounded-2xl">
          <CardContent className="py-10 text-center">
            <MapPin className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium">Select a neighborhood above</p>
            <p className="mt-1 text-sm text-muted-foreground">
              See what&apos;s happening near each area of the city.
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Full interactive map coming soon. This grid view shows neighborhood-based
        discovery.
      </p>
    </div>
  );
}
