"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Home,
  MapPin,
  PlusCircle,
  User,
  Settings,
  MessageSquare,
  Shield,
  LogOut,
  BarChart3,
} from "lucide-react";

interface AppShellProps {
  user: {
    id: string;
    name: string;
    role: string;
    screenLightMode: boolean;
  };
  children: React.ReactNode;
}

const navItems = [
  { href: "/app", label: "Feed", icon: Home },
  { href: "/app/map", label: "Map", icon: MapPin },
  { href: "/app/events/create", label: "Create", icon: PlusCircle },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        user.screenLightMode && "screen-light-mode"
      )}
    >
      {/* Desktop top bar */}
      <header className="sticky top-0 z-50 hidden border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
        <div className="flex h-14 items-center justify-between px-6">
          <Link href="/app" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">
              Community<span className="text-primary">Circle</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {user.role === "ADMIN" && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <Shield className="mr-1 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/app/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="my-2 border-t border-border" />

            <Link
              href="/app/settings"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === "/app/settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <BarChart3 className="h-5 w-5" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/app" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                aria-label={item.label}
              >
                <item.icon className={cn("h-5 w-5", item.href === "/app/events/create" && "h-6 w-6")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
