"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { GitBranch } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-foreground">
          Sign in
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-foreground">
          Connect GitHub
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Import your repositories, generate a carousel, and share a live link.
        </p>
        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-medium !text-black transition hover:bg-white/90"
        >
          <GitBranch className="h-4 w-4" />
          Continue with GitHub
        </button>
        <Link href="/" className="mt-4 block text-center text-sm text-muted hover:text-foreground">
          Back to home
        </Link>
      </div>
    </div>
  );
}
