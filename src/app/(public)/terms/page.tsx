export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — CommunityCircle",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mb-8 text-muted-foreground">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">1. Acceptance</h2>
          <p>
            By using CommunityCircle, you agree to these terms and our Community Guidelines.
            If you do not agree, please do not use the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">2. Eligibility</h2>
          <p>
            You must be at least 18 years old and a parent or legal guardian to create an account.
            CommunityCircle is designed for families; all users must comply with our
            family-friendly content policies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">3. Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the security of your account credentials.
            You agree to provide accurate information during registration and to keep your
            profile up to date. Each person may maintain only one account.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">4. Community Standards</h2>
          <p>
            All users must follow our Community Guidelines. Content that is hateful, harassing,
            political, adult-oriented, or spam will be removed. Repeated violations result in
            account suspension.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">5. Events & Safety</h2>
          <p>
            CommunityCircle facilitates connections between families but does not supervise,
            endorse, or guarantee the safety of any in-person meetup. Hosts and attendees
            participate at their own risk. We encourage all members to use our verification
            tools and meet in public spaces.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">6. Content Ownership</h2>
          <p>
            You retain ownership of content you post. By posting, you grant CommunityCircle
            a non-exclusive license to display your content within the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">7. Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these terms or our Community
            Guidelines. You may delete your account at any time.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
          <p>
            CommunityCircle is provided &quot;as is&quot; without warranties. We are not liable
            for any damages arising from your use of the platform or attendance at events
            discovered through it.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">9. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of the platform after
            changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  );
}
