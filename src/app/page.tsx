export const dynamic = "force-dynamic";
import { PublicNav } from "@/components/nav/public-nav";
import { PublicFooter } from "@/components/nav/public-footer";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Smartphone,
  Shield,
  Users,
  Heart,
  Sun,
  TreePine,
  BookOpen,
  Palette,
  Trophy,
  Sparkles,
} from "lucide-react";
import type { EventCategory } from "@prisma/client";

/* ------------------------------------------------------------------ */
/*  Category helper: maps EventCategory to an icon + Tailwind color   */
/* ------------------------------------------------------------------ */

function categoryMeta(category: EventCategory) {
  const map: Record<
    EventCategory,
    { icon: React.ReactNode; color: string; label: string }
  > = {
    WALK: {
      icon: <TreePine className="h-4 w-4" />,
      color: "bg-teal-100 text-teal-700",
      label: "Walk",
    },
    PLAYGROUND: {
      icon: <Sun className="h-4 w-4" />,
      color: "bg-sunny-100 text-sunny-700",
      label: "Playground",
    },
    LIBRARY: {
      icon: <BookOpen className="h-4 w-4" />,
      color: "bg-primary/10 text-primary",
      label: "Library",
    },
    CRAFTS: {
      icon: <Palette className="h-4 w-4" />,
      color: "bg-coral-100 text-coral-700",
      label: "Crafts",
    },
    SPORTS: {
      icon: <Trophy className="h-4 w-4" />,
      color: "bg-teal-100 text-teal-700",
      label: "Sports",
    },
    OTHER: {
      icon: <Sparkles className="h-4 w-4" />,
      color: "bg-muted text-muted-foreground",
      label: "Other",
    },
  };
  return map[category];
}

/* ------------------------------------------------------------------ */
/*  Page (server component)                                           */
/* ------------------------------------------------------------------ */

export default async function HomePage() {
  /* Fetch up to 6 upcoming active events for the preview section */
  const events = await prisma.event.findMany({
    where: {
      status: "ACTIVE",
      startAt: { gte: new Date() },
    },
    orderBy: { startAt: "asc" },
    take: 6,
    select: {
      id: true,
      title: true,
      category: true,
      startAt: true,
      locationLabelPublic: true,
      indoorOutdoor: true,
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <main className="flex-1">
        {/* -------------------------------------------------------- */}
        {/*  Hero                                                    */}
        {/* -------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 to-background py-20 md:py-32">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sunny-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-coral-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-teal-200/30 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 text-center">
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Your Neighborhood.{" "}
              <span className="text-primary">Your People.</span>{" "}
              <span className="text-teal-600">Offline.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Discover safe, screen-light meetups for families right in your
              neighborhood. Playground dates, nature walks, story times, and
              more — all designed to help you connect in person.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 text-base">
                <Link href="/auth/sign-up">Join Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-base"
              >
                <Link href="/app">Browse Events</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/*  How It Works                                            */}
        {/* -------------------------------------------------------- */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
              Three simple steps to start meeting families nearby.
            </p>

            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
                  <MapPin className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  Find Local Meetups
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Discover nature walks, playground dates, story times, and
                  creative workshops happening right in your neighborhood.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sunny-100">
                  <Calendar className="h-7 w-7 text-sunny-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  RSVP &amp; Connect
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Join safe, verified events hosted by real neighbors. Chat with
                  attendees and coordinate the details before you go.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral-100">
                  <Smartphone className="h-7 w-7 text-coral-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  Show Up &amp; Unplug
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our screen-light mode helps you put the phone away and be
                  fully present with your family and new friends.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/*  Safety First                                            */}
        {/* -------------------------------------------------------- */}
        <section className="bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100">
                <Shield className="h-7 w-7 text-teal-600" />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Safety First
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                CommunityCircle is built from the ground up with family safety in
                mind.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Badge 1 */}
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <Shield className="h-6 w-6 text-teal-500" />
                <h3 className="mt-4 font-semibold">Trust Badges &amp; Verification</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Email, phone, and ID verification build visible trust scores so
                  you know who you are meeting.
                </p>
              </div>

              {/* Badge 2 */}
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <Users className="h-6 w-6 text-teal-500" />
                <h3 className="mt-4 font-semibold">Community Guidelines</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clear rules keep conversations kind and events welcoming for
                  everyone, especially kids.
                </p>
              </div>

              {/* Badge 3 */}
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <Heart className="h-6 w-6 text-coral-500" />
                <h3 className="mt-4 font-semibold">Report &amp; Block Tools</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  One-tap reporting and blocking let you protect yourself and your
                  family instantly.
                </p>
              </div>

              {/* Badge 4 */}
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <MapPin className="h-6 w-6 text-sunny-500" />
                <h3 className="mt-4 font-semibold">Local-Only Discovery</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Events are surfaced only to nearby families, keeping your
                  community small, familiar, and safe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/*  Sample Events Preview                                   */}
        {/* -------------------------------------------------------- */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Upcoming Meetups
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
              Here is a taste of what families near you are planning.
            </p>

            {events.length > 0 ? (
              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const meta = categoryMeta(event.category);
                  const dateLabel = new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(event.startAt);

                  return (
                    <div
                      key={event.id}
                      className="rounded-2xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Category pill */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.color}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>

                      <h3 className="mt-4 font-semibold leading-snug">
                        {event.title}
                      </h3>

                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{dateLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{event.locationLabelPublic}</span>
                        </div>
                      </div>

                      {/* Indoor / Outdoor badge */}
                      <span className="mt-4 inline-block rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">
                        {event.indoorOutdoor === "INDOOR"
                          ? "Indoor"
                          : event.indoorOutdoor === "OUTDOOR"
                            ? "Outdoor"
                            : "Indoor & Outdoor"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mx-auto mt-14 max-w-md rounded-2xl bg-card p-10 text-center shadow-sm">
                <Sparkles className="mx-auto h-10 w-10 text-sunny-400" />
                <p className="mt-4 font-medium">No upcoming events yet!</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be the first to host a meetup in your neighborhood. It only
                  takes a minute.
                </p>
                <Button asChild className="mt-6 rounded-full" size="lg">
                  <Link href="/auth/sign-up">Create Your First Event</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------------- */}
        {/*  Final CTA                                               */}
        {/* -------------------------------------------------------- */}
        <section className="bg-gradient-to-t from-teal-50 to-background py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <Heart className="mx-auto h-10 w-10 text-coral-400" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to meet your neighbors?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Join a growing community of families who are putting down their
              phones and showing up for each other.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-8 text-base">
                <Link href="/auth/sign-up">Join Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 text-base"
              >
                <Link href="/app">Browse Events</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
