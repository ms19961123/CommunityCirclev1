"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  MapPin,
  Clock,
  Users,
  Smartphone,
  Home,
  CloudSun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CategoryIcon,
  categoryConfig,
  type EventCategory,
} from "@/components/category-icon";
import { TrustBadge } from "@/components/trust-badge";

export interface EventCardEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  startAt: string | Date;
  durationMins: number;
  indoorOutdoor: "INDOOR" | "OUTDOOR" | "MIXED";
  ageMin: number;
  ageMax: number;
  noDevices: boolean;
  locationLabelPublic: string;
  lat: number;
  lng: number;
  status: string;
  host: {
    name: string;
    profile: {
      trustScore: number;
    };
  };
  _count: {
    rsvps: number;
  };
  distance?: number;
}

interface EventCardProps {
  event: EventCardEvent;
  className?: string;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hours = mins / 60;
  if (Number.isInteger(hours)) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours.toFixed(1)} hrs`;
}

function formatDistance(miles: number): string {
  if (miles < 0.1) return "nearby";
  return `~${miles.toFixed(1)} mi`;
}

function IndoorOutdoorBadge({
  type,
}: {
  type: "INDOOR" | "OUTDOOR" | "MIXED";
}) {
  const config = {
    INDOOR: { icon: Home, label: "Indoor", variant: "secondary" as const },
    OUTDOOR: { icon: CloudSun, label: "Outdoor", variant: "sunny" as const },
    MIXED: { icon: CloudSun, label: "Indoor/Outdoor", variant: "outline" as const },
  };
  const { icon: Icon, label, variant } = config[type];

  return (
    <Badge variant={variant} className="gap-1 text-xs">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export function EventCard({ event, className }: EventCardProps) {
  const startDate = new Date(event.startAt);
  const config =
    categoryConfig[event.category as EventCategory] ?? categoryConfig.OTHER;

  return (
    <Link href={`/app/events/${event.id}`} className="block group">
      <Card
        className={cn(
          "rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden",
          className
        )}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex gap-3 sm:gap-4">
            {/* Category icon circle */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12",
                config.bgColor
              )}
            >
              <CategoryIcon
                category={event.category}
                className="h-5 w-5 sm:h-6 sm:w-6"
              />
            </div>

            {/* Main content */}
            <div className="min-w-0 flex-1 space-y-2">
              {/* Title */}
              <h3 className="font-semibold text-base leading-tight text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                {event.title}
              </h3>

              {/* Date and time */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {format(startDate, "EEE, MMM d")} at{" "}
                  {format(startDate, "h:mm a")}
                </span>
                <span className="text-muted-foreground/50">·</span>
                <span>{formatDuration(event.durationMins)}</span>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Age range */}
                <Badge variant="teal" className="text-xs">
                  Ages {event.ageMin}-{event.ageMax}
                </Badge>

                {/* Indoor/Outdoor */}
                <IndoorOutdoorBadge type={event.indoorOutdoor} />

                {/* Screen-light badge */}
                {event.noDevices && (
                  <Badge variant="coral" className="gap-1 text-xs">
                    <span className="relative">
                      <Smartphone className="h-3 w-3" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="block h-[1px] w-3.5 rotate-45 bg-current" />
                      </span>
                    </span>
                    Screen-light
                  </Badge>
                )}

                {/* Distance */}
                {event.distance != null && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <MapPin className="h-3 w-3" />
                    {formatDistance(event.distance)}
                  </Badge>
                )}
              </div>

              {/* Bottom row: host + RSVPs */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {/* Host info */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-muted-foreground truncate">
                    Hosted by{" "}
                    <span className="font-medium text-foreground">
                      {event.host.name}
                    </span>
                  </span>
                  <TrustBadge
                    trustScore={event.host.profile.trustScore}
                    size="sm"
                  />
                </div>

                {/* RSVP count */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {event._count.rsvps}{" "}
                    {event._count.rsvps === 1 ? "going" : "going"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
