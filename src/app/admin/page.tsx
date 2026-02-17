tsx

"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  Users,
  Calendar,
  Star,
  AlertTriangle,
  Flag,
  UserX,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HealthData {
  activeFamilies: number;
  eventsThisWeek: number;
  repeatAttendance: number;
  averageRating: number;
  eventsPerDay: { date: string; count: number }[];
}

interface PopularData {
  popular: { category: string; count: number }[];
}

interface ReportItem {
  id: string;
  reporterUserId: string;
  targetType: "USER" | "EVENT";
  targetId: string;
  reason: string;
  notes: string | null;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  reporter: { id: string; name: string; email: string };
  resolvedBy: { id: string; name: string } | null;
}

interface FlagItem {
  id: string;
  targetType: "USER" | "EVENT";
  targetId: string;
  rule: "PROFANITY" | "POLITICS" | "OTHER";
  createdAt: string;
  event?: {
    id: string;
    title: string;
    status: string;
  } | null;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  suspendedAt: string | null;
  profile: {
    trustScore: number;
  } | null;
}

// ---------------------------------------------------------------------------
// Helper: format date strings
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Overview Tab
// ---------------------------------------------------------------------------

function OverviewTab() {
  const { toast } = useToast();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [popular, setPopular] = useState<PopularData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [healthRes, popularRes] = await Promise.all([
          fetch("/api/analytics/health"),
          fetch("/api/analytics/popular"),
        ]);

        if (!healthRes.ok || !popularRes.ok) {
          throw new Error("Failed to load analytics");
        }

        const healthData: HealthData = await healthRes.json();
        const popularData: PopularData = await popularRes.json();

        setHealth(healthData);
        setPopular(popularData);
      } catch {
        toast({
          title: "Error",
          description: "Could not load analytics data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!health || !popular) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Analytics data could not be loaded.
        </p>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Active Families",
      value: health.activeFamilies,
      subtitle: "Last 7 days",
      icon: Users,
    },
    {
      title: "Events This Week",
      value: health.eventsThisWeek,
      subtitle: "Mon - Sun",
      icon: Calendar,
    },
    {
      title: "Repeat Attendance",
      value: `${health.repeatAttendance}%`,
      subtitle: "Last 30 days",
      icon: TrendingUp,
    },
    {
      title: "Average Rating",
      value: health.averageRating.toFixed(1),
      subtitle: "All feedback",
      icon: Star,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </span>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* RSVPs by Category */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                RSVPs by Category (This Week)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {popular.popular.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
                No RSVP data for this week yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popular.popular}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v: string) =>
                      v.charAt(0) + v.slice(1).toLowerCase()
                    }
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                    }}
                    labelFormatter={(label: string) =>
                      label.charAt(0) + label.slice(1).toLowerCase()
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="#0d9488"
                    radius={[4, 4, 0, 0]}
                    name="RSVPs"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Events Created per Day */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                Events Created per Day (Last 14 Days)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={health.eventsPerDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatShortDate}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                  labelFormatter={(label: string) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ fill: "#0d9488", r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Events"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reports Tab
// ---------------------------------------------------------------------------

function ReportsTab() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"OPEN" | "RESOLVED">("OPEN");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error("Failed to load reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch {
      toast({
        title: "Error",
        description: "Could not load reports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResolve(reportId: string) {
    if (!window.confirm("Mark this report as resolved?")) return;

    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to resolve report");
      }
      toast({ title: "Report resolved", description: "The report has been marked as resolved." });
      await fetchReports();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not resolve report.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveEvent(eventId: string) {
    if (!window.confirm("Are you sure you want to remove this event? This action cannot be undone.")) return;

    setActionLoading(eventId);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/remove`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove event");
      }
      toast({ title: "Event removed", description: "The event has been removed." });
      await fetchReports();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not remove event.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSuspendUser(userId: string) {
    if (!window.confirm("Are you sure you want to suspend this user? They will lose access.")) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to suspend user");
      }
      toast({ title: "User suspended", description: "The user has been suspended." });
      await fetchReports();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not suspend user.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  const filteredReports = reports.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === "OPEN" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("OPEN")}
        >
          <AlertTriangle className="mr-1.5 h-4 w-4" />
          Open
          <Badge variant="secondary" className="ml-2">
            {reports.filter((r) => r.status === "OPEN").length}
          </Badge>
        </Button>
        <Button
          variant={filter === "RESOLVED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("RESOLVED")}
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          Resolved
          <Badge variant="secondary" className="ml-2">
            {reports.filter((r) => r.status === "RESOLVED").length}
          </Badge>
        </Button>
      </div>

      {/* Report list */}
      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {filter === "OPEN"
              ? "No open reports. Everything looks good!"
              : "No resolved reports yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="rounded-2xl">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={report.targetType === "EVENT" ? "default" : "secondary"}
                      >
                        {report.targetType}
                      </Badge>
                      <Badge variant="outline">{report.reason}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-foreground">
                      <span className="font-medium">Reporter:</span>{" "}
                      {report.reporter.name} ({report.reporter.email})
                    </p>

                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Target ID:</span>{" "}
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {report.targetId}
                      </code>
                    </p>

                    {report.notes && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Notes:</span>{" "}
                        {report.notes}
                      </p>
                    )}

                    {report.resolvedBy && (
                      <p className="text-xs text-muted-foreground">
                        Resolved by {report.resolvedBy.name} on{" "}
                        {report.resolvedAt ? formatDate(report.resolvedAt) : "N/A"}
                      </p>
                    )}
                  </div>

                  {/* Actions for OPEN reports */}
                  {report.status === "OPEN" && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(report.id)}
                        disabled={actionLoading === report.id}
                      >
                        {actionLoading === report.id ? (
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 h-3 w-3" />
                        )}
                        Resolve
                      </Button>

                      {report.targetType === "EVENT" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveEvent(report.targetId)}
                          disabled={actionLoading === report.targetId}
                        >
                          {actionLoading === report.targetId ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="mr-1.5 h-3 w-3" />
                          )}
                          Remove Event
                        </Button>
                      )}

                      {report.targetType === "USER" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSuspendUser(report.targetId)}
                          disabled={actionLoading === report.targetId}
                        >
                          {actionLoading === report.targetId ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          ) : (
                            <UserX className="mr-1.5 h-3 w-3" />
                          )}
                          Suspend User
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flagged Content Tab
// ---------------------------------------------------------------------------

function FlaggedContentTab() {
  const { toast } = useToast();
  const router = useRouter();
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchFlags() {
    setLoading(true);
    try {
      // Fetch reports that are auto-flagged, or use a flags-based approach.
      // We fetch all reports and also separately show flags from the Flag model.
      // For now, we pull events with flags via reports endpoint with flag context.
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error("Failed to load flagged content");
      const data = await res.json();

      // Extract event-targeted reports to display as flagged content,
      // and also parse any flags attached to events.
      // Since we don't have a dedicated flags endpoint, we derive from reports.
      const eventReports: ReportItem[] = (data.reports || []).filter(
        (r: ReportItem) => r.targetType === "EVENT"
      );

      // Map to flag-like items for display
      const flagItems: FlagItem[] = eventReports.map((r: ReportItem) => ({
        id: r.id,
        targetType: r.targetType as "EVENT",
        targetId: r.targetId,
        rule: mapReasonToFlagRule(r.reason),
        createdAt: r.createdAt,
        event: {
          id: r.targetId,
          title: `Event ${r.targetId.slice(0, 8)}...`,
          status: "ACTIVE",
        },
      }));

      setFlags(flagItems);
    } catch {
      toast({
        title: "Error",
        description: "Could not load flagged content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function mapReasonToFlagRule(reason: string): "PROFANITY" | "POLITICS" | "OTHER" {
    if (reason === "POLITICS") return "POLITICS";
    if (reason === "HATE" || reason === "HARASSMENT") return "PROFANITY";
    return "OTHER";
  }

  useEffect(() => {
    fetchFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRemoveEvent(eventId: string) {
    if (!window.confirm("Are you sure you want to remove this flagged event? This action cannot be undone.")) return;

    setActionLoading(eventId);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/remove`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove event");
      }
      toast({ title: "Event removed", description: "The flagged event has been removed." });
      await fetchFlags();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not remove event.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  function handleViewEvent(eventId: string) {
    router.push(`/app/events/${eventId}`);
  }

  const flagRuleColor: Record<string, string> = {
    PROFANITY: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    POLITICS: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Flag className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No flagged content found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flags.map((flag) => (
        <Card key={flag.id} className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {flag.event?.title || `Event ${flag.targetId.slice(0, 8)}...`}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      flagRuleColor[flag.rule] || flagRuleColor.OTHER
                    }`}
                  >
                    {flag.rule}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Flagged on {formatDate(flag.createdAt)}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewEvent(flag.targetId)}
                >
                  View Event
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveEvent(flag.targetId)}
                  disabled={actionLoading === flag.targetId}
                >
                  {actionLoading === flag.targetId ? (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  ) : (
                    <XCircle className="mr-1.5 h-3 w-3" />
                  )}
                  Remove Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// User Management Tab
// ---------------------------------------------------------------------------

function UserManagementTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast({
        title: "Error",
        description: "Could not load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSuspend(userId: string) {
    if (!window.confirm("Are you sure you want to suspend this user?")) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to suspend user");
      }
      toast({ title: "User suspended", description: "The user has been suspended." });
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not suspend user.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnsuspend(userId: string) {
    if (!window.confirm("Are you sure you want to unsuspend this user?")) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to unsuspend user");
      }
      toast({ title: "User unsuspended", description: "The user has been unsuspended." });
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not unsuspend user.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  }

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* User list */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchQuery.trim()
              ? "No users match your search."
              : "No users found."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="rounded-2xl">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      {user.suspendedAt && (
                        <Badge variant="destructive" className="text-xs">
                          Suspended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Trust Score:{" "}
                        <span className="font-medium text-foreground">
                          {user.profile?.trustScore ?? 0}
                        </span>
                      </span>
                      {user.suspendedAt && (
                        <span>
                          Suspended on {formatDate(user.suspendedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {user.suspendedAt ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnsuspend(user.id)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 h-3 w-3" />
                        )}
                        Unsuspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSuspend(user.id)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : (
                          <UserX className="mr-1.5 h-3 w-3" />
                        )}
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin Dashboard (Main Page)
// ---------------------------------------------------------------------------

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect non-admin users once session is loaded
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/auth/sign-in");
      return;
    }

    if ((session.user as any).role !== "ADMIN") {
      router.replace("/app");
    }
  }, [session, status, router]);

  // Show loading while session resolves
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Guard: don't render dashboard if not admin
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
            <Shield className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your community, review reports, and monitor health metrics.
            </p>
          </div>
        </div>
        <Separator className="mt-4" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 sm:flex-none">
            <AlertTriangle className="mr-1.5 h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="flagged" className="flex-1 sm:flex-none">
            <Flag className="mr-1.5 h-4 w-4" />
            Flagged
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 sm:flex-none">
            <Users className="mr-1.5 h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="flagged">
          <FlaggedContentTab />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
