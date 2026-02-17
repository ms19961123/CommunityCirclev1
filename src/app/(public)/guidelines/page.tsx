import type { Metadata } from "next";
import {
  Heart,
  Shield,
  Ban,
  MessageSquareOff,
  UserX,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Community Guidelines — CommunityCircle",
};

const rules = [
  {
    icon: Heart,
    title: "Family-Friendly Always",
    description:
      "All events and conversations must be appropriate for children of all ages. Keep language clean and topics suitable for a family audience.",
    color: "text-coral-500",
    bg: "bg-coral-50",
  },
  {
    icon: Ban,
    title: "No Hate or Harassment",
    description:
      "Zero tolerance for discrimination, bullying, threats, or harassment of any kind. Treat every family with dignity and respect.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: MessageSquareOff,
    title: "No Politics or Partisan Debate",
    description:
      "CommunityCircle is an apolitical space. Events and messages must not promote political parties, candidates, campaigns, or partisan topics.",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: UserX,
    title: "No Doxxing or Privacy Violations",
    description:
      "Never share another person's private information — including real addresses, phone numbers, photos of other people's children, or identifying details — without explicit consent.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: AlertTriangle,
    title: "No Adult Content",
    description:
      "This platform is for families. No sexually explicit, violent, or otherwise adult-only content in any form.",
    color: "text-sunny-600",
    bg: "bg-sunny-50",
  },
  {
    icon: Shield,
    title: "No Solicitation or Spam",
    description:
      "Do not use CommunityCircle to sell products, recruit for MLMs, solicit donations, or spam. Events must be genuine community gatherings.",
    color: "text-teal-500",
    bg: "bg-teal-50",
  },
];

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Community Guidelines
        </h1>
        <p className="text-lg text-muted-foreground">
          CommunityCircle exists to help families connect safely offline. These
          rules keep our community welcoming for everyone.
        </p>
      </div>

      <div className="space-y-6">
        {rules.map((rule) => (
          <div
            key={rule.title}
            className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${rule.bg}`}
            >
              <rule.icon className={`h-6 w-6 ${rule.color}`} />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">{rule.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-muted/50 p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold">Enforcement</h3>
        <p className="text-sm text-muted-foreground">
          Violations may result in content removal, event cancellation, or
          account suspension. We review all reports within 24 hours. If you see
          something that breaks these rules, please use the Report button on any
          event or profile.
        </p>
      </div>
    </div>
  );
}
