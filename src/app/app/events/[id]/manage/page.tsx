"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  Calendar,
  MapPin,
  Loader2,
  ChevronLeft,
  MessageSquare,
  XCircle,
  Edit3,
  CheckCircle2,
  Clock,
  Save,
} from "lucide-react";

interface EventData {
  id: string;
  title: string;
  description: string;
  category: string;
  startAt: string;
  durationMins: number;
  indoorOutdoor: string;
  ageMin: number;
  ageMax: number;
  maxAttendees: number;
  noDevices: boolean;
  locationLabelPublic: string;
  locationNotesPrivate: string;
  status: string;
  host: { id: string; name: string };
  _count: { rsvps: number };
}

interface RSVPData {
  id: string;
  status: string;
  checkedInAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export default function ManageEventPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    locationLabelPublic: "",
    locationNotesPrivate: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const eventRes = await fetch(`/api/events/${eventId}`);

        if (eventRes.ok) {
          const json = await eventRes.json();
          const eventData = json.event || json;
          setEvent(eventData);
          setEditForm({
            title: eventData.title,
            description: eventData.description,
            locationLabelPublic: eventData.locationLabelPublic,
            locationNotesPrivate: eventData.locationNotesPrivate || "",
          });
        }

        // Fetch RSVPs separately
        const rsvpRes = await fetch(`/api/events/${eventId}/rsvps`);
        if (rsvpRes.ok) {
          const data = await rsvpRes.json();
          if (data.rsvps) setRsvps(data.rsvps);
        }
      } catch {
        // handled by null check
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/events/${eventId}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        toast({ title: "Event cancelled" });
        router.push("/app");
      } else {
        const data = await res.json();
        toast({ title: data.error || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.event || data;
        setEvent((e) => (e ? { ...e, ...updated } : null));
        setEditing(false);
        toast({ title: "Event updated!" });
      } else {
        const data = await res.json();
        toast({ title: data.error || "Failed to update", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Event not found.</p>
        <Button asChild className="mt-4">
          <Link href="/app">Back to Feed</Link>
        </Button>
      </div>
    );
  }

  const goingRsvps = rsvps.filter((r) => r.status === "GOING");
  const isPast = new Date(event.startAt) < new Date();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/app/events/${eventId}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Manage Event</h1>
          <p className="text-sm text-muted-foreground">{event.title}</p>
        </div>
        {event.status === "CANCELLED" && (
          <Badge variant="destructive">Cancelled</Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{goingRsvps.length}</p>
            <p className="text-xs text-muted-foreground">
              of {event.maxAttendees} spots
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-sm font-medium">
              {new Date(event.startAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(event.startAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-primary" />
            <p className="text-sm font-medium">{event.durationMins} min</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Section */}
      {editing ? (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Edit Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={4}
              />
            </div>
            <div>
              <Label>Public Location Label</Label>
              <Input
                value={editForm.locationLabelPublic}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    locationLabelPublic: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>Private Meeting Notes</Label>
              <Textarea
                value={editForm.locationNotesPrivate}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    locationNotesPrivate: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-2">
          {event.status === "ACTIVE" && !isPast && (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Event
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/app/messages?eventId=${eventId}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message Attendees
                </Link>
              </Button>
            </>
          )}
        </div>
      )}

      {/* Attendees */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Attendees ({goingRsvps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {goingRsvps.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No RSVPs yet. Share your event to get attendees!
            </p>
          ) : (
            <div className="space-y-3">
              {goingRsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {rsvp.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{rsvp.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        RSVP&apos;d{" "}
                        {new Date(rsvp.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {rsvp.checkedInAt && (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Checked in
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Summary */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <Badge variant="secondary">{event.category}</Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Setting</span>
            <span>{event.indoorOutdoor}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ages</span>
            <span>
              {event.ageMin}–{event.ageMax} years
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location</span>
            <span>{event.locationLabelPublic}</span>
          </div>
          {event.locationNotesPrivate && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Private Notes</span>
                <span className="max-w-[200px] text-right">
                  {event.locationNotesPrivate}
                </span>
              </div>
            </>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Screen-Light</span>
            <span>{event.noDevices ? "Yes" : "No"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Event */}
      {event.status === "ACTIVE" && !isPast && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Event
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
              <AlertDialogDescription>
                This will notify all {goingRsvps.length} attendee
                {goingRsvps.length !== 1 ? "s" : ""} that the event has been
                cancelled. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Event</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {cancelling && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Yes, Cancel Event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
