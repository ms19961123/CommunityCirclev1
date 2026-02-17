import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CommunityCircle",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-8 text-muted-foreground">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <div className="prose prose-neutral max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">What We Collect</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Name, email address, and optional phone number for account creation.</li>
            <li>Approximate location (city-level or coordinates you provide) to show nearby events.</li>
            <li>Kids age ranges (never names) to tailor event recommendations.</li>
            <li>Event RSVPs, messages, and feedback you voluntarily submit.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">How We Use Your Data</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Display events near your approximate location.</li>
            <li>Show your public profile to other verified community members.</li>
            <li>Send event reminders and safety notifications.</li>
            <li>Improve the platform through anonymized, aggregated analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">What We Never Do</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>We never reveal your exact address or precise GPS coordinates to other users.</li>
            <li>We never sell your personal information to third parties.</li>
            <li>We never share your kids age information publicly.</li>
            <li>We never display private event location details to non-RSVPed users.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Location Privacy</h2>
          <p>
            Your location is stored as latitude/longitude coordinates to calculate distances to events.
            Other users only ever see an approximate distance (e.g., &quot;~1.2 mi away&quot;) and a
            neighborhood label if you provide one. Your exact coordinates are never shared.
          </p>
          <p className="mt-2">
            Private event location details (meeting spots, specific corners) are only visible to the
            host and attendees who have RSVPed as &quot;Going.&quot;
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Data Retention</h2>
          <p>
            You can delete your account at any time. When you do, we remove all your personal data,
            events, and messages within 30 days. Anonymized aggregate data (e.g., event counts) may
            be retained.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">Contact</h2>
          <p>
            Questions about your privacy? Reach out through our{" "}
            <a href="/help" className="text-primary underline">
              Help page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
