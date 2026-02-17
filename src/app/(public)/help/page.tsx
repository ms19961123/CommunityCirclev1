"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { Send, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "What is CommunityCircle?",
    a: "CommunityCircle is a local, family-friendly meetup platform that helps parents discover and host safe offline activities like walks, playground meetups, library story times, and craft swaps in their neighborhood.",
  },
  {
    q: "Is CommunityCircle free?",
    a: "Yes! CommunityCircle is completely free for all families. We believe community connection should be accessible to everyone.",
  },
  {
    q: "How does location privacy work?",
    a: "We never reveal your exact address. Other users only see approximate distance (e.g., '~1.2 mi away'). Private event meeting details are only shared with confirmed attendees.",
  },
  {
    q: "What is Screen-Light Mode?",
    a: "Screen-Light Mode reduces on-screen distractions after you RSVP to an event. It shows only essential info and gently reminds you to put the phone down and enjoy the moment.",
  },
  {
    q: "How do I report inappropriate content?",
    a: "Every event and profile has a Report button. Select a reason, add optional details, and our team reviews all reports within 24 hours.",
  },
  {
    q: "What are trust badges?",
    a: "Trust badges show verification status: Email Verified, Phone Verified, and ID Verified (coming soon). Higher verification = more trust from other families.",
  },
  {
    q: "Can I host events without phone verification?",
    a: "Yes, but you're limited to 1 event per day. Phone verification unlocks up to 3 events per day.",
  },
  {
    q: "How do I block someone?",
    a: "Visit their profile and click the Block button. Blocked users can't see your events or message you, and you won't see their content either.",
  },
];

export default function HelpPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 48 hours.",
      });
      form.reset();
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <HelpCircle className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Help & FAQ
        </h1>
        <p className="text-lg text-muted-foreground">
          Answers to common questions and a way to reach us.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                required
                placeholder="What can we help with?"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Tell us more..."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
