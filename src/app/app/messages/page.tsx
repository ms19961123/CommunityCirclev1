"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  Send,
  Loader2,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Thread {
  id: string;
  eventId: string;
  event: {
    id: string;
    title: string;
    startAt: string;
  };
  messages: Message[];
}

interface Message {
  id: string;
  senderUserId: string;
  body: string;
  createdAt: string;
  sender: { name: string };
}

export default function MessagesPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setUserId(data.user?.id || data.id));
  }, []);

  useEffect(() => {
    if (eventId) {
      fetch(`/api/threads?eventId=${eventId}`)
        .then((r) => r.json())
        .then((data) => {
          const thread = data.thread || data;
          if (thread.id) {
            setActiveThread(thread);
            setThreads([thread]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // Load all user's threads (events they're part of)
      fetch("/api/events?myEvents=true")
        .then((r) => r.json())
        .then(async (events) => {
          const loadedThreads: Thread[] = [];
          for (const evt of events.slice(0, 10)) {
            try {
              const res = await fetch(`/api/threads?eventId=${evt.id}`);
              if (res.ok) {
                const data = await res.json();
                const thread = data.thread || data;
                if (thread.id) loadedThreads.push(thread);
              }
            } catch {
              // skip
            }
          }
          setThreads(loadedThreads);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [eventId]);

  async function handleSend() {
    if (!newMessage.trim() || !activeThread) return;
    setSending(true);
    try {
      const res = await fetch(`/api/threads/${activeThread.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const msg = data.message || data;
        setActiveThread((t) =>
          t ? { ...t, messages: [...t.messages, msg] } : null
        );
        setNewMessage("");
      } else {
        const data = await res.json();
        toast({ title: data.error || "Failed to send", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Active thread view
  if (activeThread) {
    return (
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col p-4 md:h-[calc(100vh-4rem)]">
        <div className="mb-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveThread(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold">{activeThread.event.title}</h2>
            <p className="text-xs text-muted-foreground">
              {new Date(activeThread.event.startAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border bg-card p-4">
          {activeThread.messages.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderUserId === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.senderUserId === userId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="mb-0.5 text-xs font-medium opacity-70">
                    {msg.sender.name}
                  </p>
                  <p className="text-sm">{msg.body}</p>
                  <p className="mt-1 text-[10px] opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Thread list view
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Messages</h1>

      {threads.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <h3 className="mb-1 font-semibold">No conversations yet</h3>
            <p className="text-sm text-muted-foreground">
              RSVP to an event to start messaging with other attendees.
            </p>
            <Button asChild className="mt-4">
              <Link href="/app">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        threads.map((thread) => (
          <Card
            key={thread.id}
            className="cursor-pointer rounded-2xl transition-shadow hover:shadow-md"
            onClick={() => setActiveThread(thread)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="truncate font-medium">{thread.event.title}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {thread.messages.length > 0
                    ? thread.messages[thread.messages.length - 1].body
                    : "No messages yet"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(thread.event.startAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                {thread.messages.length > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {thread.messages.length} msg{thread.messages.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
