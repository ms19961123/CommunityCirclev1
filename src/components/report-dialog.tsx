"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type ReportReason =
  | "HARASSMENT"
  | "HATE"
  | "UNSAFE"
  | "SPAM"
  | "POLITICS"
  | "OTHER";

const reportReasons: { value: ReportReason; label: string }[] = [
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "HATE", label: "Hate speech or discrimination" },
  { value: "UNSAFE", label: "Unsafe for children" },
  { value: "SPAM", label: "Spam or misleading" },
  { value: "POLITICS", label: "Political content" },
  { value: "OTHER", label: "Other" },
];

interface ReportDialogProps {
  targetType: "EVENT" | "USER";
  targetId: string;
  trigger: ReactNode;
}

export function ReportDialog({
  targetType,
  targetId,
  trigger,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!reason) return;

    setSubmitting(true);

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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit report");
      }

      toast({
        title: "Report submitted",
        description:
          "Thank you for helping keep our community safe. We'll review this shortly.",
      });

      // Reset and close
      setReason("");
      setNotes("");
      setOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description:
          err instanceof Error
            ? err.message
            : "Could not submit report. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Report {targetType === "EVENT" ? "Event" : "User"}
            </DialogTitle>
            <DialogDescription>
              Help us keep the community safe. All reports are reviewed by our
              moderation team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Reason select */}
            <div className="space-y-2">
              <Label htmlFor="report-reason">
                Reason <span className="text-destructive">*</span>
              </Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as ReportReason)}
              >
                <SelectTrigger id="report-reason" className="rounded-lg">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="report-notes">
                Additional details{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="report-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any additional context that may help our review..."
                rows={3}
                maxLength={1000}
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/1000
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!reason || submitting}
              className={cn(
                "rounded-lg gap-2",
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              )}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
