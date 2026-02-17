import Link from "next/link";
import { Users } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">CommunityCircle</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Safe, screen-light meetups for families in your neighborhood.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground">
                  Help & FAQ
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-foreground">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Community</h4>
            <p className="text-sm text-muted-foreground">
              Built with care for families who want to spend more time offline, together.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CommunityCircle. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
