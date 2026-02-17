"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Users, Menu, X } from "lucide-react";
import { useState } from "react";

export function PublicNav() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Community<span className="text-primary">Circle</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/guidelines"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Guidelines
          </Link>
          <Link
            href="/help"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Help
          </Link>
          {session ? (
            <Button asChild>
              <Link href="/app">Open App</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Join Free</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/guidelines"
              className="text-sm text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Guidelines
            </Link>
            <Link
              href="/help"
              className="text-sm text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Help
            </Link>
            {session ? (
              <Button asChild className="w-full">
                <Link href="/app">Open App</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="w-full">
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth/sign-up">Join Free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
