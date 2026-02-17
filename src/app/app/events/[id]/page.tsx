"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Shield,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Flag,
  Loader2,
  TreePine,
  Sun,
  BookOpen,
  Palette,
  Trophy,
  Sparkles,
  Star,
  ChevronLeft,
  MessageSquare,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface EventHost {
  id: string
  name: string
  profile: {
    trustScore: number
    emailVerifiedAt: string | null
    phoneVerifiedAt: string | null
  }
}

interface EventRsvp {
  id: string
  status: string
  checkedInAt: string | null
}

interface EventData {
  id: string
  title: string
  description: string
  category: string
  startAt: string
  durationMins: number
  indoorOutdoor: string
  ageMin: number
  ageMax: number
  maxAttendees: number
  noDevices: boolean
  locationLabelPublic: string
  locationNotesPrivate?: string
  lat: number
  lng: number
  status: string
  createdAt: string
  host: EventHost
  _count: { rsvps: number }
  userRsvp?: EventRsvp
}

interface CurrentUser {
  id: string
  name: string
}

/* -------------------------------------------------------------------------- */
/*  Category config                                                           */
/* -------------------------------------------------------------------------- */

const CATEGORIES: Record<
  string,
  { icon: any; label: string; color: string; bg: string }
> = {
  WALK: { icon: TreePine, label: "Walk", color: "text-teal-600", bg: "bg-teal-50" },
  PLAYGROUND: { icon: Sun, label: "Playground", color: "text-amber-600", bg: "bg-amber-50" },
  LIBRARY: { icon: BookOpen, label: "Library", color: "text-blue-600", bg: "bg-blue-50" },
  CRAFTS: { icon: Palette, label: "Crafts", color: "text-orange-600", bg: "bg-orange-50" },
  SPORTS: { icon: Trophy, label: "Sports", color: "text-emerald-600", bg: "bg-emerald-50" },
  OTHER: { icon: Sparkles, label: "Other", color: "text-gray-600", bg: "bg-gray-50" },
}

/* -------------------------------------------------------------------------- */
/*  Feedback tag options                                                      */
/* -------------------------------------------------------------------------- */

const FEEDBACK_TAGS = ["safe", "welcoming", "kid-loved", "well-organized", "fun"]

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatEventTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} minutes`
  const hrs = mins / 60
  if (Number.isInteger(hrs)) return `${hrs} hour${hrs > 1 ? "s" : ""}`
  return `${hrs} hours`
}

function isEventPast(startAt: string, durationMins: number): boolean {
  const end = new Date(startAt)
  end.setMinutes(end.getMinutes() + durationMins)
  return end < new Date()
}

function formatCheckedInTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

/* -------------------------------------------------------------------------- */
/*  Skeleton loader                                                           */
/* -------------------------------------------------------------------------- */

function EventDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 animate-pulse">
      <div className="h-5 w-20 rounded bg-muted mb-4" />
      <div className="h-4 w-16 rounded bg-muted mb-2" />
      <div className="h-8 w-3/4 rounded bg-muted mb-6" />
      <div className="space-y-4">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-32 w-full rounded-2xl bg-muted" />
        <div className="h-24 w-full rounded-2xl bg-muted" />
        <div className="h-48 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main page component                                                       */
/* -------------------------------------------------------------------------- */

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const eventId = params.id as string

  // ----- state -----
  const [event, setEvent] = useState<EventData | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  // RSVP dialog
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false)
  const [rsvpMessage, setRsvpMessage] = useState("")
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false)
  const [justRsvpd, setJustRsvpd] = useState(false)

  // Cancel RSVP
  const [cancellingRsvp, setCancellingRsvp] = useState(false)

  // Check-in
  const [checkingIn, setCheckingIn] = useState(false)

  // Feedback
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null)
  const [feedbackTags, setFeedbackTags] = useState<string[]>([])
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // ----- data fetching -----
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const [eventRes, meRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch("/api/me"),
        ])

        if (eventRes.status === 404) {
          setNotFound(true)
          return
        }

        if (!eventRes.ok) {
          throw new Error("Failed to load event")
        }

        const eventJson = await eventRes.json()
        // API returns { event, rsvpCount, userRsvp } — merge into flat object
        const eventData = eventJson.event
          ? { ...eventJson.event, userRsvp: eventJson.userRsvp, _count: { rsvps: eventJson.rsvpCount ?? eventJson.event?._count?.rsvps ?? 0 } }
          : eventJson
        setEvent(eventData)

        if (meRes.ok) {
          const meData = await meRes.json()
          const user = meData.user || meData
          setCurrentUser({ id: user.id, name: user.name })
        }
      } catch (err) {
        setError("Something went wrong loading this event. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchData()
    }
  }, [eventId])

  // ----- handlers -----

  async function handleRsvp() {
    if (!event) return
    setRsvpSubmitting(true)
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: rsvpMessage || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to RSVP")
      }
      const rsvpData = await res.json()
      const rsvp = rsvpData.rsvp || rsvpData

      setEvent((prev) =>
        prev
          ? {
              ...prev,
              userRsvp: rsvp,
              _count: { rsvps: prev._count.rsvps + 1 },
              ...(rsvpData.locationNotesPrivate && { locationNotesPrivate: rsvpData.locationNotesPrivate }),
            }
          : prev
      )

      setRsvpDialogOpen(false)
      setRsvpMessage("")
      setJustRsvpd(true)
      toast({ title: "You're going!", description: "RSVP confirmed." })
    } catch (err: any) {
      toast({
        title: "RSVP failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setRsvpSubmitting(false)
    }
  }

  async function handleCancelRsvp() {
    if (!event) return
    setCancellingRsvp(true)
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to cancel RSVP")

      setEvent((prev) =>
        prev
          ? {
              ...prev,
              userRsvp: undefined,
              _count: { rsvps: Math.max(0, prev._count.rsvps - 1) },
            }
          : prev
      )
      setJustRsvpd(false)
      toast({ title: "RSVP cancelled", description: "You are no longer attending." })
    } catch {
      toast({
        title: "Error",
        description: "Could not cancel RSVP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCancellingRsvp(false)
    }
  }

  async function handleCheckIn() {
    if (!event) return
    setCheckingIn(true)
    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to check in")
      const data = await res.json()
      const checkedInAt = data.rsvp?.checkedInAt || data.checkedInAt

      setEvent((prev) =>
        prev && prev.userRsvp
          ? {
              ...prev,
              userRsvp: { ...prev.userRsvp, checkedInAt },
            }
          : prev
      )
      toast({ title: "Checked in!", description: "Enjoy the event." })
    } catch {
      toast({
        title: "Check-in failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setCheckingIn(false)
    }
  }

  async function handleFeedbackSubmit() {
    if (!event || feedbackRating === null) return
    setFeedbackSubmitting(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          rating: feedbackRating,
          tags: feedbackTags,
        }),
      })
      if (!res.ok) throw new Error("Failed to submit feedback")
      setFeedbackSubmitted(true)
      toast({ title: "Thanks!", description: "Your feedback has been submitted." })
    } catch {
      toast({
        title: "Error",
        description: "Could not submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  function toggleFeedbackTag(tag: string) {
    setFeedbackTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  // ----- render states -----

  if (loading) {
    return <EventDetailSkeleton />
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Event not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          This event may have been removed or the link is incorrect.
        </p>
        <Button variant="outline" asChild>
          <Link href="/app">
            <ChevronLeft className="mr-1.5 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error || "Unable to load this event."}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  // ----- derived values -----
  const cat = CATEGORIES[event.category] || CATEGORIES.OTHER
  const CategoryIcon = cat.icon
  const past = isEventPast(event.startAt, event.durationMins)
  const spotsLeft = event.maxAttendees - event._count.rsvps
  const isFull = spotsLeft <= 0
  const attendeePercent = Math.min(
    100,
    Math.round((event._count.rsvps / event.maxAttendees) * 100)
  )
  const isHost = currentUser?.id === event.host.id
  const hasRsvpGoing = event.userRsvp?.status === "GOING"
  const canRsvp =
    !hasRsvpGoing &&
    event.status === "ACTIVE" &&
    !past &&
    !isFull &&
    !isHost

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/app">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </Button>

      {/* ------------------------------------------------------------------ */}
      {/*  Header: category badge + title + status                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${cat.bg} ${cat.color} border-0`}>
            <CategoryIcon className="mr-1 h-3 w-3" />
            {cat.label}
          </Badge>
          {event.status === "CANCELLED" && (
            <Badge variant="destructive">Cancelled</Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {event.title}
        </h1>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Date / Time                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">
                {formatEventDate(event.startAt)} at {formatEventTime(event.startAt)}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(event.durationMins)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                {event.locationLabelPublic}
              </p>
              {hasRsvpGoing && event.locationNotesPrivate && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200">
                  <p className="font-medium mb-0.5">Location details (for attendees)</p>
                  <p>{event.locationNotesPrivate}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/*  Details section                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              Ages {event.ageMin}-{event.ageMax}
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              {event.indoorOutdoor === "INDOOR"
                ? "Indoor"
                : event.indoorOutdoor === "OUTDOOR"
                ? "Outdoor"
                : "Indoor/Outdoor"}
            </Badge>
            {event.noDevices && (
              <Badge variant="teal" className="rounded-full">
                <Smartphone className="mr-1 h-3 w-3" />
                Screen-Light Event
              </Badge>
            )}
          </div>

          {/* Attendees progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {event._count.rsvps} / {event.maxAttendees} spots filled
                </span>
              </div>
              {isFull && (
                <span className="text-xs font-medium text-amber-600">Full</span>
              )}
            </div>
            <Progress value={attendeePercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/*  Description                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            About this event
          </h2>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/*  Host section                                                       */}
      {/* ------------------------------------------------------------------ */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Hosted by
          </h2>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-semibold text-foreground text-lg">
                {event.host.name}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-teal-600" />
                <span>Trust Score: {event.host.profile.trustScore}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {event.host.profile.emailVerifiedAt && (
              <Badge variant="teal" className="rounded-full text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Email Verified
              </Badge>
            )}
            {event.host.profile.phoneVerifiedAt && (
              <Badge variant="sunny" className="rounded-full text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Phone Verified
              </Badge>
            )}
          </div>

          {!isHost && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link
                href={`/app/reports/new?type=USER&id=${event.host.id}`}
              >
                <Flag className="mr-1.5 h-3.5 w-3.5" />
                Report Host
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/*  RSVP section                                                       */}
      {/* ------------------------------------------------------------------ */}
      {event.status !== "CANCELLED" && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* === Just RSVP'd: Offline Nudge === */}
            {justRsvpd && hasRsvpGoing && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-4 dark:bg-emerald-950 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                    You&apos;re going!
                  </h3>
                </div>

                <div className="space-y-1.5 text-sm text-emerald-800 dark:text-emerald-200">
                  <p className="font-medium">{event.title}</p>
                  <p>
                    {formatEventDate(event.startAt)} at{" "}
                    {formatEventTime(event.startAt)}
                  </p>
                  <p>{event.locationLabelPublic}</p>
                </div>

                {event.locationNotesPrivate && (
                  <div className="rounded-xl bg-emerald-100 p-3 text-sm text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    <p className="font-medium mb-0.5">Location details</p>
                    <p>{event.locationNotesPrivate}</p>
                  </div>
                )}

                {event.noDevices && (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <Smartphone className="h-4 w-4" />
                    <span>Put the phone down and enjoy the moment.</span>
                  </div>
                )}

                <Separator className="bg-emerald-200 dark:bg-emerald-700" />

                {event.userRsvp?.checkedInAt ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Checked in at{" "}
                      {formatCheckedInTime(event.userRsvp.checkedInAt)}
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {checkingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking in...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Check In
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* === Already RSVP'd GOING (not just now) === */}
            {!justRsvpd && hasRsvpGoing && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-4 dark:bg-emerald-950 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                    You&apos;re attending this event
                  </h3>
                </div>

                {event.userRsvp?.checkedInAt ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Checked in at{" "}
                      {formatCheckedInTime(event.userRsvp.checkedInAt)}
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {checkingIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking in...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Check In
                      </>
                    )}
                  </Button>
                )}

                <Separator className="bg-emerald-200 dark:bg-emerald-700" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelRsvp}
                  disabled={cancellingRsvp}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {cancellingRsvp ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel RSVP"
                  )}
                </Button>
              </div>
            )}

            {/* === Event is full === */}
            {!hasRsvpGoing && isFull && !isHost && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-center dark:bg-amber-950 dark:border-amber-800">
                <Users className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  Event is full
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  All {event.maxAttendees} spots have been filled.
                </p>
              </div>
            )}

            {/* === Can RSVP === */}
            {canRsvp && (
              <Dialog open={rsvpDialogOpen} onOpenChange={setRsvpDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full text-base">
                    RSVP to this Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>RSVP to {event.title}</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    {/* Safety reminder */}
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                          Remember: meet in public places. Trust your instincts.
                        </p>
                      </div>
                    </div>

                    {/* Host trust info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-teal-600" />
                      <span>
                        Hosted by {event.host.name} (Trust Score:{" "}
                        {event.host.profile.trustScore})
                      </span>
                    </div>

                    {/* Screen-light note */}
                    {event.noDevices && (
                      <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300">
                        <Smartphone className="h-4 w-4" />
                        <span>
                          This is a screen-light event. Please minimize device
                          usage.
                        </span>
                      </div>
                    )}

                    {/* Optional message */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Any questions for the host?{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </label>
                      <Textarea
                        value={rsvpMessage}
                        onChange={(e) => setRsvpMessage(e.target.value)}
                        placeholder="e.g. Do we need to bring anything?"
                        rows={3}
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleRsvp}
                      disabled={rsvpSubmitting}
                    >
                      {rsvpSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        "Confirm RSVP"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* === Past event, no RSVP section needed === */}
            {!hasRsvpGoing && past && !isFull && !isHost && (
              <div className="rounded-2xl bg-muted/50 p-5 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="font-semibold text-foreground">
                  This event has ended
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  RSVPs are no longer available.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Feedback section (after event end)                                 */}
      {/* ------------------------------------------------------------------ */}
      {past && hasRsvpGoing && !feedbackSubmitted && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              <h2 className="text-lg font-semibold text-foreground">
                How did it go?
              </h2>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFeedbackRating(n)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                      feedbackRating === n
                        ? "border-teal-500 bg-teal-500 text-white scale-110"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-teal-400 hover:text-teal-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Tags (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFeedbackTag(tag)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                      feedbackTags.includes(tag)
                        ? "bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-900 dark:border-teal-700 dark:text-teal-200"
                        : "bg-background border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleFeedbackSubmit}
              disabled={feedbackRating === null || feedbackSubmitting}
              className="w-full"
            >
              {feedbackSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {past && hasRsvpGoing && feedbackSubmitted && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Thank you for your feedback!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*  Actions (manage / report)                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        {isHost && (
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/app/events/${event.id}/manage`}>
              Manage Event
            </Link>
          </Button>
        )}

        {!isHost && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            asChild
          >
            <Link href={`/app/reports/new?type=EVENT&id=${event.id}`}>
              <Flag className="mr-1.5 h-3.5 w-3.5" />
              Report Event
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
