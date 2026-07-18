"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [githubAuth, setGithubAuth] = useState(false);

  useEffect(() => {
    void fetch("/api/config")
      .then((r) => r.json())
      .then((data: { githubAuth?: boolean }) => setGithubAuth(Boolean(data.githubAuth)))
      .catch(() => setGithubAuth(false));
  }, []);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl tracking-tight text-balance text-foreground">
        Settings
      </h1>
      <p className="mt-2 text-muted">GitHub connection and sharing defaults.</p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="font-display text-lg tracking-tight">GitHub</h2>
          {!githubAuth ? (
            <p className="mt-2 text-sm text-muted">
              Add <code className="font-mono text-xs">AUTH_GITHUB_ID</code>,{" "}
              <code className="font-mono text-xs">AUTH_GITHUB_SECRET</code>, and{" "}
              <code className="font-mono text-xs">AUTH_SECRET</code> to{" "}
              <code className="font-mono text-xs">.env.local</code> to enable GitHub
              sign-in.
            </p>
          ) : status === "authenticated" ? (
            <>
              <p className="mt-2 text-sm text-muted">
                Connected as{" "}
                <span className="font-medium text-foreground">
                  {session.user?.login ?? session.user?.name}
                </span>
                . Only your public repositories can be imported.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                GitWrapped uses GitHub sign-in only to verify your account and read public
                repository data. It does not request email, private profile data, private
                repositories, or organization access. If you previously granted broader
                access, disconnect and sign in again to refresh permissions.
              </p>
              <Button
                variant="secondary"
                onClick={() => signOut({ callbackUrl: "/settings" })}
                className="mt-4"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                GitWrapped uses GitHub sign-in only to verify your account and read public
                repository data. It does not request email, private profile data, private
                repositories, or organization access.
              </p>
              <Button
                onClick={() => signIn("github", { callbackUrl: "/settings" })}
                className="mt-4"
              >
                Sign in with GitHub
              </Button>
            </>
          )}
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="font-display text-lg tracking-tight">Sharing</h2>
          <p className="mt-2 text-sm text-muted">
            Generating a story creates a public link at{" "}
            <code className="font-mono text-xs">/s/[id]</code> so anyone can view the
            carousel without downloading.
          </p>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="font-display text-lg tracking-tight">Export defaults</h2>
          <p className="mt-2 text-sm text-muted">
            Preferred PNG size: LinkedIn Portrait (1080×1350). Change per export anytime.
          </p>
        </section>
      </div>
    </div>
  );
}
