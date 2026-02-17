tsx

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  MapPin,
  Heart,
  Shield,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
} from "lucide-react";

const STEPS = [
  { label: "Basics", icon: Users },
  { label: "Interests", icon: Heart },
  { label: "Location", icon: MapPin },
  { label: "Verification", icon: Shield },
];

const INTERESTS = [
  "walks",
  "playground",
  "library",
  "crafts",
  "sports",
  "nature",
  "music",
  "cooking",
  "art",
  "gardening",
];

const AGE_RANGES = ["0-2", "3-5", "6-8", "9-12", "13+"];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const [form, setForm] = useState({
    city: "Philadelphia",
    lat: 39.9526,
    lng: -75.1652,
    radiusMiles: 5,
    interests: [] as string[],
    kidsAgeRanges: [] as string[],
  });

  function toggleInterest(interest: string) {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
  }

  function toggleAgeRange(range: string) {
    setForm((f) => ({
      ...f,
      kidsAgeRanges: f.kidsAgeRanges.includes(range)
        ? f.kidsAgeRanges.filter((r) => r !== range)
        : [...f.kidsAgeRanges, range],
    }));
  }

  async function handleVerifyEmail() {
    setVerifyingEmail(true);
    try {
      const res = await fetch("/api/verify/email", { method: "POST" });
      if (res.ok) {
        toast({ title: "Email verified!", description: "You can now host events." });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setVerifyingEmail(false);
    }
  }

  async function handleSubmit() {
    if (form.interests.length === 0) {
      toast({
        title: "Pick at least one interest",
        variant: "destructive",
      });
      return;
    }
    if (form.kidsAgeRanges.length === 0) {
      toast({
        title: "Select your kids' age ranges",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }

      toast({ title: "Profile complete!", description: "Welcome to CommunityCircle." });
      router.push("/app");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Set up your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}: {STEPS[step].label}
          </p>
        </div>

        <Progress value={progress} className="mb-6" />

        {/* Step indicators */}
        <div className="mb-6 flex justify-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => i < step && setStep(i)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
              aria-label={s.label}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Step 0: Basics */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  Your Kids&apos; Age Ranges
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Select all that apply. We never collect kids&apos; names.
                </p>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((range) => (
                    <button
                      key={range}
                      onClick={() => toggleAgeRange(range)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        form.kidsAgeRanges.includes(range)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {range} yrs
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  What activities interest your family?
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Pick at least one. This helps us show relevant events.
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                        form.interests.includes(interest)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Your city"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={form.lat}
                    onChange={(e) =>
                      setForm({ ...form, lat: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={form.lng}
                    onChange={(e) =>
                      setForm({ ...form, lng: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                For the MVP, enter approximate coordinates. Your exact location is never
                shown publicly.
              </p>
              <div>
                <Label>Search Radius: {form.radiusMiles} miles</Label>
                <Slider
                  value={[form.radiusMiles]}
                  onValueChange={([v]) => setForm({ ...form, radiusMiles: v })}
                  min={1}
                  max={25}
                  step={1}
                  className="mt-2"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>1 mi</span>
                  <span>25 mi</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-teal-50 p-4">
                <h3 className="mb-1 font-semibold text-teal-800">
                  Email Verification
                </h3>
                <p className="mb-3 text-sm text-teal-700">
                  Required to host events. In this demo, click to verify instantly.
                </p>
                <Button
                  size="sm"
                  onClick={handleVerifyEmail}
                  disabled={verifyingEmail}
                >
                  {verifyingEmail ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Verify Email (Dev)
                </Button>
              </div>

              <div className="rounded-xl bg-sunny-50 p-4">
                <h3 className="mb-1 font-semibold text-sunny-800">
                  Phone Verification
                </h3>
                <p className="mb-3 text-sm text-sunny-700">
                  Recommended. Unlocks higher event creation limits. Dev OTP: 123456
                </p>
                <Badge variant="outline">Optional — can do later in Settings</Badge>
              </div>

              <div className="rounded-xl bg-muted p-4">
                <h3 className="mb-1 font-semibold">ID Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Coming soon. Will provide the highest trust level.
                </p>
                <Badge variant="outline" className="mt-2">
                  Coming Soon
                </Badge>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
