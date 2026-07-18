"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { GitBranch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [pending, setPending] = useState(false);

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
          Sign in
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-balance text-foreground">
          Connect GitHub
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted">
          GitWrapped uses GitHub sign-in to verify your account and import public
          repository data. It does not request access to private repositories or
          organizations.
        </p>
        <Button
          size="lg"
          disabled={pending}
          aria-busy={pending}
          onClick={() => {
            setPending(true);
            void signIn("github", { callbackUrl: "/dashboard" });
          }}
          className="mt-8 w-full"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <GitBranch className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? "Connecting…" : "Continue with GitHub"}
        </Button>
        <Link
          href="/"
          className="mt-4 block rounded-md py-1 text-center text-sm text-muted transition-colors hover:text-foreground"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
