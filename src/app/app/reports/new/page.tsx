"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Flag, ChevronLeft, Loader2, AlertTriangle } from "lucide-react";

const REASONS = [
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "HATE", label: "Hate speech or discrimination" },
  { value: "UNSAFE", label: "Unsafe behavior or environment" },
  { value: "SPAM", label: "Spam or solicitation" },
  { value: "POLITICS", label: "Political or partisan content" },
  { value: "OTHER", label: "Other concern" },
];

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const targetType = (searchParams.get("type") || "EVENT").toUpperCase();
  const targetId = searchParams.get("id") || "";

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!reason) {
      toast({ title: "Please select a reason", variant: "destructive" });
      return;
    }

    if (!targetId) {
      toast({ title: "Missing target ID", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          notes: notes.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast({
          title: "Report submitted",
          description:
            "Thank you for helping keep CommunityCircle safe. We'll review this within 24 hours.",
        });
        router.back();
      } else {
        const data = await res.json();
        toast({
          title: data.error || "Failed to submit report",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Submit a Report</h1>
      </div>

      <div className="rounded-xl bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Help us keep CommunityCircle safe
            </p>
            <p className="mt-1 text-xs text-amber-700">
              All reports are reviewed by our moderation team within 24 hours. False reports may result in
              action on the reporting account.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flag className="h-5 w-5 text-destructive" />
            Report {targetType === "USER" ? "User" : "Event"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>What&apos;s the issue?</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">
                Additional details{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any additional context that would help our team review this report..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Reporting {targetType.toLowerCase()} ID:{" "}
              <code className="rounded bg-muted px-1">{targetId}</code>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading || !reason}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
