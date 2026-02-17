"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Smartphone,
  MapPin,
  Bell,
  Eye,
  Loader2,
  Save,
  Phone,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");

  const [settings, setSettings] = useState({
    screenLightMode: false,
    radiusMiles: 5,
    city: "",
    lat: 0,
    lng: 0,
    phoneVerified: false,
  });

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        const profile = data.user?.profile || data.profile;
        if (profile) {
          setSettings({
            screenLightMode: profile.screenLightMode,
            radiusMiles: profile.radiusMiles,
            city: profile.city,
            lat: profile.lat || 0,
            lng: profile.lng || 0,
            phoneVerified: !!profile.phoneVerifiedAt,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: settings.city,
          lat: settings.lat,
          lng: settings.lng,
          radiusMiles: settings.radiusMiles,
          screenLightMode: settings.screenLightMode,
        }),
      });
      if (res.ok) {
        toast({ title: "Settings saved!" });
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Error saving settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleVerifyPhone() {
    setPhoneVerifying(true);
    try {
      const res = await fetch("/api/verify/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: phoneCode }),
      });
      if (res.ok) {
        toast({ title: "Phone verified!" });
        setSettings((s) => ({ ...s, phoneVerified: true }));
      } else {
        const data = await res.json();
        toast({ title: data.error || "Invalid code", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setPhoneVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Screen-Light Mode */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            Screen-Light Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="screen-light" className="text-sm font-medium">
                Enable Screen-Light Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                After RSVPing, see minimal UI and offline nudges
              </p>
            </div>
            <Switch
              id="screen-light"
              checked={settings.screenLightMode}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, screenLightMode: checked }))
              }
            />
          </div>
          {settings.screenLightMode && (
            <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">
              When active, after you RSVP to an event you&apos;ll see a simplified
              view with just the essentials — encouraging you to put the phone
              down and enjoy the moment.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location & Radius */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Location & Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={settings.city}
              onChange={(e) =>
                setSettings((s) => ({ ...s, city: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={settings.lat}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    lat: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                value={settings.lng}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    lng: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <Label>Discovery Radius: {settings.radiusMiles} miles</Label>
            <Slider
              value={[settings.radiusMiles]}
              onValueChange={([v]) =>
                setSettings((s) => ({ ...s, radiusMiles: v }))
              }
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
        </CardContent>
      </Card>

      {/* Phone Verification */}
      {!settings.phoneVerified && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-sunny-600" />
              Phone Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Verify your phone to unlock higher event creation limits (3/day
              instead of 1/day). Dev OTP: 123456
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter 6-digit code"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                maxLength={6}
              />
              <Button
                onClick={handleVerifyPhone}
                disabled={phoneVerifying || phoneCode.length !== 6}
              >
                {phoneVerifying && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences (UI stub) */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Event reminders</Label>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm">New messages</Label>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm">Nearby event suggestions</Label>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show profile to other members</Label>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show approximate distance</Label>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save Settings
      </Button>
    </div>
  );
}
