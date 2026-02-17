"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Sparkles,
  Calendar,
  Users,
  MapPin,
  Smartphone,
  Eye,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const TOTAL_STEPS = 6;

const CATEGORY_OPTIONS = [
  { value: "WALK", label: "Walk" },
  { value: "PLAYGROUND", label: "Playground" },
  { value: "LIBRARY", label: "Library" },
  { value: "CRAFTS", label: "Crafts" },
  { value: "SPORTS", label: "Sports" },
  { value: "OTHER", label: "Other" },
];

const DURATION_OPTIONS = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

const STEP_META = [
  { label: "Basics", icon: Sparkles },
  { label: "When", icon: Calendar },
  { label: "Who", icon: Users },
  { label: "Where", icon: MapPin },
  { label: "Screen-Light", icon: Smartphone },
  { label: "Review", icon: Eye },
];

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FormData {
  title: string;
  category: string;
  description: string;
  startAt: string;
  duration: string;
  ageMin: number;
  ageMax: number;
  maxAttendees: number;
  locationLabelPublic: string;
  locationNotesPrivate: string;
  indoorOutdoor: string;
  lat: number | null;
  lng: number | null;
  noDevices: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function CreateEventPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [moderationError, setModerationError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    startAt: "",
    duration: "",
    ageMin: 0,
    ageMax: 17,
    maxAttendees: 10,
    locationLabelPublic: "",
    locationNotesPrivate: "",
    indoorOutdoor: "OUTDOOR",
    lat: null,
    lng: null,
    noDevices: false,
  });

  /* ---- Fetch user profile on mount to pre-fill lat/lng ---- */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          const profile = data.user?.profile || data.profile;
          if (profile) {
            setForm((prev) => ({
              ...prev,
              lat: profile.lat ?? prev.lat,
              lng: profile.lng ?? prev.lng,
            }));
          }
        }
      } catch {
        // Silently fail - user can enter manually
      }
    }
    fetchProfile();
  }, []);

  /* ---- Field updater helpers ---- */
  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear the specific field error on change
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setModerationError(null);
  }

  /* ---- Validation ---- */
  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};

    switch (s) {
      case 1: {
        if (form.title.length < 6 || form.title.length > 80) {
          errs.title = "Title must be between 6 and 80 characters.";
        }
        if (!form.category) {
          errs.category = "Please select a category.";
        }
        if (form.description.length < 20 || form.description.length > 600) {
          errs.description =
            "Description must be between 20 and 600 characters.";
        }
        break;
      }
      case 2: {
        if (!form.startAt) {
          errs.startAt = "Please choose a date and time.";
        } else if (new Date(form.startAt) <= new Date()) {
          errs.startAt = "Start time must be in the future.";
        }
        if (!form.duration) {
          errs.duration = "Please select a duration.";
        }
        break;
      }
      case 3: {
        if (form.ageMin < 0 || form.ageMin > 17) {
          errs.ageMin = "Minimum age must be between 0 and 17.";
        }
        if (form.ageMax < 0 || form.ageMax > 17) {
          errs.ageMax = "Maximum age must be between 0 and 17.";
        }
        if (form.ageMin > form.ageMax) {
          errs.ageMax = "Max age must be greater than or equal to min age.";
        }
        if (form.maxAttendees < 2 || form.maxAttendees > 50) {
          errs.maxAttendees = "Max attendees must be between 2 and 50.";
        }
        break;
      }
      case 4: {
        if (!form.locationLabelPublic.trim()) {
          errs.locationLabelPublic = "Location name is required.";
        }
        break;
      }
      // Steps 5 and 6 have no blocking validation
      default:
        break;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  /* ---- Navigation ---- */
  function handleNext() {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  }

  function handleBack() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  /* ---- Submit ---- */
  async function handleSubmit() {
    setSubmitting(true);
    setModerationError(null);

    try {
      const payload = {
        title: form.title,
        category: form.category,
        description: form.description,
        startAt: new Date(form.startAt).toISOString(),
        durationMins: Number(form.duration),
        ageMin: form.ageMin,
        ageMax: form.ageMax,
        maxAttendees: form.maxAttendees,
        locationLabelPublic: form.locationLabelPublic,
        locationNotesPrivate: form.locationNotesPrivate,
        indoorOutdoor: form.indoorOutdoor,
        lat: form.lat,
        lng: form.lng,
        noDevices: form.noDevices,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error) {
          setModerationError(data.error);
        } else {
          toast({
            title: "Error",
            description: data.error || "Something went wrong.",
            variant: "destructive",
          });
        }
        return;
      }

      // Check for soft moderation flag
      if (data.flagged) {
        toast({
          title: "Event created with a note",
          description:
            data.flagMessage ||
            "Your event was created but flagged for review.",
        });
      } else {
        toast({ title: "Event created!", description: "Your event is live." });
      }

      const eventId = data.event?.id || data.id;
      router.push(`/app/events/${eventId}`);
    } catch {
      toast({
        title: "Network error",
        description: "Could not reach the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- Helper to format date for review ---- */
  function formatDateTime(iso: string): string {
    if (!iso) return "Not set";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function durationLabel(val: string): string {
    return DURATION_OPTIONS.find((d) => d.value === val)?.label ?? val;
  }

  function categoryLabel(val: string): string {
    return CATEGORY_OPTIONS.find((c) => c.value === val)?.label ?? val;
  }

  /* ======================================================================== */
  /*  Step renderers                                                           */
  /* ======================================================================== */

  function renderStep1() {
    return (
      <div className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            placeholder="e.g. Saturday Morning Nature Walk"
            maxLength={80}
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          <div className="flex justify-between">
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
            <p className="ml-auto text-xs text-muted-foreground">
              {form.title.length}/80
            </p>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.category}
            onValueChange={(v) => updateField("category", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what families can expect at this event..."
            maxLength={600}
            rows={5}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
          <div className="flex justify-between">
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
            <p className="ml-auto text-xs text-muted-foreground">
              {form.description.length}/600
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-5">
        {/* Start date/time */}
        <div className="space-y-2">
          <Label htmlFor="startAt">Start Date & Time</Label>
          <Input
            id="startAt"
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => updateField("startAt", e.target.value)}
          />
          {errors.startAt && (
            <p className="text-sm text-destructive">{errors.startAt}</p>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select
            value={form.duration}
            onValueChange={(v) => updateField("duration", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="How long is the event?" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.duration && (
            <p className="text-sm text-destructive">{errors.duration}</p>
          )}
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Set the age range for kids and the maximum number of families that can
          attend.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Age Min */}
          <div className="space-y-2">
            <Label htmlFor="ageMin">Min Age</Label>
            <Input
              id="ageMin"
              type="number"
              min={0}
              max={17}
              value={form.ageMin}
              onChange={(e) =>
                updateField("ageMin", Math.max(0, Number(e.target.value)))
              }
            />
            {errors.ageMin && (
              <p className="text-sm text-destructive">{errors.ageMin}</p>
            )}
          </div>

          {/* Age Max */}
          <div className="space-y-2">
            <Label htmlFor="ageMax">Max Age</Label>
            <Input
              id="ageMax"
              type="number"
              min={0}
              max={17}
              value={form.ageMax}
              onChange={(e) =>
                updateField("ageMax", Math.max(0, Number(e.target.value)))
              }
            />
            {errors.ageMax && (
              <p className="text-sm text-destructive">{errors.ageMax}</p>
            )}
          </div>
        </div>

        {/* Max attendees */}
        <div className="space-y-2">
          <Label htmlFor="maxAttendees">Max Attendees</Label>
          <Input
            id="maxAttendees"
            type="number"
            min={2}
            max={50}
            value={form.maxAttendees}
            onChange={(e) =>
              updateField("maxAttendees", Math.max(2, Number(e.target.value)))
            }
          />
          <p className="text-xs text-muted-foreground">
            Between 2 and 50 families.
          </p>
          {errors.maxAttendees && (
            <p className="text-sm text-destructive">{errors.maxAttendees}</p>
          )}
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="space-y-5">
        {/* Location label */}
        <div className="space-y-2">
          <Label htmlFor="locationLabelPublic">Location Name</Label>
          <Input
            id="locationLabelPublic"
            placeholder="e.g. Rittenhouse Square"
            value={form.locationLabelPublic}
            onChange={(e) =>
              updateField("locationLabelPublic", e.target.value)
            }
          />
          {errors.locationLabelPublic && (
            <p className="text-sm text-destructive">
              {errors.locationLabelPublic}
            </p>
          )}
        </div>

        {/* Location notes */}
        <div className="space-y-2">
          <Label htmlFor="locationNotesPrivate">
            Meeting Notes{" "}
            <span className="text-muted-foreground font-normal">
              (visible after RSVP)
            </span>
          </Label>
          <Textarea
            id="locationNotesPrivate"
            placeholder="e.g. Meet at SW corner near fountain"
            rows={3}
            value={form.locationNotesPrivate}
            onChange={(e) =>
              updateField("locationNotesPrivate", e.target.value)
            }
          />
        </div>

        {/* Indoor / Outdoor */}
        <div className="space-y-2">
          <Label>Indoor / Outdoor</Label>
          <RadioGroup
            value={form.indoorOutdoor}
            onValueChange={(v) => updateField("indoorOutdoor", v)}
            className="flex gap-4"
          >
            {(["INDOOR", "OUTDOOR", "MIXED"] as const).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`io-${opt}`} />
                <Label htmlFor={`io-${opt}`} className="font-normal capitalize">
                  {opt.toLowerCase()}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Lat / Lng */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              placeholder="e.g. 39.9496"
              value={form.lat ?? ""}
              onChange={(e) =>
                updateField(
                  "lat",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              placeholder="e.g. -75.1718"
              value={form.lng ?? ""}
              onChange={(e) =>
                updateField(
                  "lng",
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Coordinates are pre-filled from your profile. Adjust if the event is
          elsewhere.
        </p>
      </div>
    );
  }

  function renderStep5() {
    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-teal-50 p-4 text-sm text-teal-800 leading-relaxed">
          <p className="font-semibold mb-2">What is Screen-Light Mode?</p>
          <p>
            When enabled, attendees who RSVP will see a minimal, distraction-free
            interface. This encourages everyone to be present and enjoy the
            activity without screens. Great for nature walks, playground
            meetups, and crafts sessions.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="noDevices" className="text-base font-medium">
              Enable Screen-Light Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Encourage a device-free experience
            </p>
          </div>
          <Switch
            id="noDevices"
            checked={form.noDevices}
            onCheckedChange={(v) => updateField("noDevices", v)}
          />
        </div>
      </div>
    );
  }

  function renderStep6() {
    return (
      <div className="space-y-6">
        {/* Moderation error banner */}
        {moderationError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive font-medium">
            {moderationError}
          </div>
        )}

        {/* Basics */}
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Sparkles className="h-4 w-4" /> Basics
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Title:</span> {form.title}
            </p>
            <p>
              <span className="font-medium">Category:</span>{" "}
              <Badge variant="secondary">{categoryLabel(form.category)}</Badge>
            </p>
            <p>
              <span className="font-medium">Description:</span>{" "}
              {form.description}
            </p>
          </div>
        </div>

        {/* When */}
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Calendar className="h-4 w-4" /> When
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Start:</span>{" "}
              {formatDateTime(form.startAt)}
            </p>
            <p>
              <span className="font-medium">Duration:</span>{" "}
              {durationLabel(form.duration)}
            </p>
          </div>
        </div>

        {/* Who */}
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Users className="h-4 w-4" /> Who
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Ages:</span> {form.ageMin} &ndash;{" "}
              {form.ageMax} years
            </p>
            <p>
              <span className="font-medium">Max attendees:</span>{" "}
              {form.maxAttendees} families
            </p>
          </div>
        </div>

        {/* Where */}
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <MapPin className="h-4 w-4" /> Where
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Location:</span>{" "}
              {form.locationLabelPublic}
            </p>
            {form.locationNotesPrivate && (
              <p>
                <span className="font-medium">Notes:</span>{" "}
                {form.locationNotesPrivate}
              </p>
            )}
            <p>
              <span className="font-medium">Setting:</span>{" "}
              <Badge variant="outline" className="capitalize">
                {form.indoorOutdoor.toLowerCase()}
              </Badge>
            </p>
            {form.lat !== null && form.lng !== null && (
              <p className="text-muted-foreground">
                Coords: {form.lat}, {form.lng}
              </p>
            )}
          </div>
        </div>

        {/* Screen-Light */}
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Smartphone className="h-4 w-4" /> Screen-Light
          </h3>
          <p className="text-sm">
            {form.noDevices ? (
              <Badge className="bg-teal-600">Enabled</Badge>
            ) : (
              <Badge variant="outline">Not enabled</Badge>
            )}
          </p>
        </div>
      </div>
    );
  }

  /* ---- Step content dispatcher ---- */
  const stepRenderers: Record<number, () => React.JSX.Element> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
    5: renderStep5,
    6: renderStep6,
  };

  /* ======================================================================== */
  /*  Render                                                                   */
  /* ======================================================================== */

  const progressPercent = (step / TOTAL_STEPS) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ---- Header ---- */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create Event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step {step} of {TOTAL_STEPS} &mdash; {STEP_META[step - 1].label}
        </p>
      </div>

      {/* ---- Progress bar ---- */}
      <Progress value={progressPercent} className="mb-6 h-2" />

      {/* ---- Step indicators ---- */}
      <div className="mb-8 flex items-center justify-between">
        {STEP_META.map((meta, idx) => {
          const stepNum = idx + 1;
          const completed = step > stepNum;
          const active = step === stepNum;
          const Icon = meta.icon;

          return (
            <div
              key={stepNum}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                    ? "border-primary bg-background text-primary"
                    : "border-muted bg-muted text-muted-foreground"
                }`}
              >
                {completed ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={`hidden text-[11px] sm:block ${
                  active
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ---- Step card ---- */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-5 sm:p-7">
          {stepRenderers[step]()}
        </CardContent>
      </Card>

      {/* ---- Navigation buttons ---- */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button onClick={handleNext} className="gap-1">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Event"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
