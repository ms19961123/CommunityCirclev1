"use client";

import { format } from "date-fns";
import {
  PartyPopper,
  CalendarCheck,
  MapPin,
  Smartphone,
  StickyNote,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OfflineNudgeEvent {
  title: string;
  startAt: string | Date;
  locationLabelPublic: string;
  locationNotesPrivate?: string | null;
  noDevices: boolean;
}

interface OfflineNudgeProps {
  event: OfflineNudgeEvent;
  onCheckIn: () => void;
  className?: string;
}

export function OfflineNudge({
  event,
  onCheckIn,
  className,
}: OfflineNudgeProps) {
  const startDate = new Date(event.startAt);

  return (
    <Card
      className={cn(
        "rounded-2xl border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 shadow-md dark:border-emerald-800 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-green-950/20",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Celebration header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60">
            <PartyPopper className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
              You&apos;re going!
            </h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              See you there
            </p>
          </div>
        </div>

        {/* Event summary */}
        <div className="space-y-2.5 rounded-xl bg-white/60 p-4 dark:bg-white/5">
          <h4 className="font-semibold text-foreground">{event.title}</h4>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {format(startDate, "EEEE, MMMM d")} at{" "}
              {format(startDate, "h:mm a")}
            </span>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{event.locationLabelPublic}</span>
          </div>

          {/* Private meeting notes (now visible after RSVP) */}
          {event.locationNotesPrivate && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-950/30">
              <StickyNote className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300 text-xs uppercase tracking-wide mb-1">
                  Meeting Notes
                </p>
                <p className="text-amber-700 dark:text-amber-400">
                  {event.locationNotesPrivate}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Screen-light notice */}
        {event.noDevices && (
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-4 dark:bg-rose-950/30">
            <div className="relative shrink-0 mt-0.5">
              <Smartphone className="h-5 w-5 text-rose-500 dark:text-rose-400" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="block h-[1.5px] w-5 rotate-45 bg-rose-500 dark:bg-rose-400" />
              </span>
            </div>
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              This is a screen-light event. Put the phone down and enjoy the
              moment.
            </p>
          </div>
        )}

        {/* Check-in button */}
        <Button
          onClick={onCheckIn}
          size="lg"
          className="w-full rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-base font-semibold gap-2"
        >
          <CheckCircle2 className="h-5 w-5" />
          Check In
        </Button>

        {/* Reminder text */}
        <p className="text-center text-xs text-muted-foreground">
          Check in when you arrive. Then unplug and enjoy.
        </p>
      </CardContent>
    </Card>
  );
}
