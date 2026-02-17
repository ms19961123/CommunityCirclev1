"use client";

import { useState } from "react";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryConfig,
  type EventCategory,
} from "@/components/category-icon";

export interface EventFilters {
  dateWindow: "today" | "weekend" | "week" | "custom";
  categories: EventCategory[];
  ageMin: number;
  ageMax: number;
  indoorOutdoor: "all" | "INDOOR" | "OUTDOOR" | "MIXED";
  noDevicesOnly: boolean;
  timeOfDay: "any" | "morning" | "afternoon" | "evening";
  radiusMiles: number;
}

export const defaultFilters: EventFilters = {
  dateWindow: "week",
  categories: [],
  ageMin: 0,
  ageMax: 18,
  indoorOutdoor: "all",
  noDevicesOnly: false,
  timeOfDay: "any",
  radiusMiles: 5,
};

interface EventFiltersProps {
  filters: EventFilters;
  onFilterChange: (filters: EventFilters) => void;
  className?: string;
}

const RADIUS_OPTIONS = [1, 3, 5, 10, 25];

const allCategories: EventCategory[] = [
  "WALK",
  "PLAYGROUND",
  "LIBRARY",
  "CRAFTS",
  "SPORTS",
  "OTHER",
];

function countActiveFilters(filters: EventFilters): number {
  let count = 0;
  if (filters.dateWindow !== defaultFilters.dateWindow) count++;
  if (filters.categories.length > 0) count++;
  if (
    filters.ageMin !== defaultFilters.ageMin ||
    filters.ageMax !== defaultFilters.ageMax
  )
    count++;
  if (filters.indoorOutdoor !== "all") count++;
  if (filters.noDevicesOnly) count++;
  if (filters.timeOfDay !== "any") count++;
  if (filters.radiusMiles !== defaultFilters.radiusMiles) count++;
  return count;
}

export function EventFilters({
  filters,
  onFilterChange,
  className,
}: EventFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = countActiveFilters(filters);

  function update(partial: Partial<EventFilters>) {
    onFilterChange({ ...filters, ...partial });
  }

  function toggleCategory(cat: EventCategory) {
    const current = filters.categories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    update({ categories: next });
  }

  function resetFilters() {
    onFilterChange({ ...defaultFilters });
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mobile toggle + quick info */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-2 rounded-xl sm:hidden"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="teal" className="ml-1 px-1.5 py-0 text-xs">
              {activeCount}
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="gap-1 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter panel -- always visible on desktop, collapsible on mobile */}
      <div
        className={cn(
          "rounded-2xl border bg-card p-4 shadow-sm space-y-5",
          "sm:block",
          expanded ? "block" : "hidden sm:block"
        )}
      >
        {/* Row 1: Date Window + Time of Day + Radius */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Date window */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              When
            </Label>
            <Select
              value={filters.dateWindow}
              onValueChange={(v) =>
                update({ dateWindow: v as EventFilters["dateWindow"] })
              }
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="weekend">This Weekend</SelectItem>
                <SelectItem value="week">Next 7 Days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time of day */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Time of Day
            </Label>
            <Select
              value={filters.timeOfDay}
              onValueChange={(v) =>
                update({ timeOfDay: v as EventFilters["timeOfDay"] })
              }
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Time</SelectItem>
                <SelectItem value="morning">Morning (before noon)</SelectItem>
                <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
                <SelectItem value="evening">Evening (after 5 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Radius */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Distance: {filters.radiusMiles} mi
            </Label>
            <Slider
              value={[RADIUS_OPTIONS.indexOf(filters.radiusMiles)]}
              min={0}
              max={RADIUS_OPTIONS.length - 1}
              step={1}
              onValueChange={([i]) => {
                update({ radiusMiles: RADIUS_OPTIONS[i] });
              }}
              className="pt-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              {RADIUS_OPTIONS.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Categories */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Categories
          </Label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
              const config = categoryConfig[cat];
              const Icon = config.icon;
              const isActive = filters.categories.includes(cat);

              return (
                <label
                  key={cat}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-200"
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => toggleCategory(cat)}
                    className="sr-only"
                  />
                  <Icon className={cn("h-4 w-4", config.color)} />
                  {config.label}
                </label>
              );
            })}
          </div>
        </div>

        {/* Row 3: Age Range + Indoor/Outdoor + No Devices */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Age range */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Ages: {filters.ageMin} - {filters.ageMax}
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[filters.ageMin, filters.ageMax]}
                min={0}
                max={18}
                step={1}
                onValueChange={([min, max]) => {
                  update({ ageMin: min, ageMax: max });
                }}
                className="flex-1"
              />
            </div>
          </div>

          {/* Indoor / Outdoor */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Setting
            </Label>
            <Select
              value={filters.indoorOutdoor}
              onValueChange={(v) =>
                update({
                  indoorOutdoor: v as EventFilters["indoorOutdoor"],
                })
              }
            >
              <SelectTrigger className="rounded-lg">
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

          {/* No Devices Only */}
          <div className="flex items-end pb-1">
            <div className="flex items-center gap-2">
              <Switch
                id="no-devices"
                checked={filters.noDevicesOnly}
                onCheckedChange={(checked) =>
                  update({ noDevicesOnly: checked === true })
                }
              />
              <Label htmlFor="no-devices" className="text-sm cursor-pointer">
                Screen-light only
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
