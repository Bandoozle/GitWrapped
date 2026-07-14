"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Projects" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <header className="relative z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="group flex items-baseline gap-2">
          <span className="font-display text-lg tracking-tight text-foreground">
            GitWrapped
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-white !text-black"
                    : "text-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {status === "authenticated" ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2 rounded-md px-3 py-1.5 text-sm text-muted hover:text-foreground"
              title={session.user?.login ?? session.user?.name ?? "Account"}
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="ml-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium !text-black"
            >
              GitHub
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
