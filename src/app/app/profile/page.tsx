"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Loader2,
  CheckCircle2,
  Star,
} from "lucide-react";
import Link from "next/link";

interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  profile: {
    city: string;
    radiusMiles: number;
    interests: string[];
    kidsAgeRanges: string[];
    screenLightMode: boolean;
    emailVerifiedAt: string | null;
    phoneVerifiedAt: string | null;
    idVerifiedAt: string | null;
    trustScore: number;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.user || data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleVerifyEmail() {
    const res = await fetch("/api/verify/email", { method: "POST" });
    if (res.ok) {
      toast({ title: "Email verified!" });
      // Refresh profile
      const data = await fetch("/api/me").then((r) => r.json());
      setProfile(data.user || data);
    }
  }

  async function handleVerifyPhone() {
    const res = await fetch("/api/verify/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "123456" }),
    });
    if (res.ok) {
      toast({ title: "Phone verified!" });
      const data = await fetch("/api/me").then((r) => r.json());
      setProfile(data.user || data);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Failed to load profile.
      </div>
    );
  }

  const p = profile.profile;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Trust & Verification */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Trust & Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trust Score</span>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-sunny-500" />
              <span className="text-lg font-bold">{p.trustScore}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email Verification</span>
              </div>
              {p.emailVerifiedAt ? (
                <Badge variant="default" className="bg-teal-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={handleVerifyEmail}>
                  Verify Now
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Phone Verification</span>
              </div>
              {p.phoneVerifiedAt ? (
                <Badge variant="default" className="bg-sunny-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={handleVerifyPhone}>
                  Verify (Dev: 123456)
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ID Verification</span>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Profile Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {p.city} · {p.radiusMiles} mi radius
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Joined{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">Kids Age Ranges</p>
            <div className="flex flex-wrap gap-1.5">
              {p.kidsAgeRanges.map((r) => (
                <Badge key={r} variant="secondary">
                  {r} yrs
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {p.interests.map((i) => (
                <Badge key={i} variant="outline" className="capitalize">
                  {i}
                </Badge>
              ))}
            </div>
          </div>

          {p.screenLightMode && (
            <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">
              Screen-Light Mode is active. You&apos;ll see minimal UI after RSVPs.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Badge variant="outline" className="text-xs">
          {profile.role}
        </Badge>
      </div>
    </div>
  );
}
