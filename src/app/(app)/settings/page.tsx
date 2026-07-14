"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

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
      <h1 className="font-display text-4xl tracking-tight text-foreground">Settings</h1>
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
                . Private and public repos can be imported.
              </p>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/settings" })}
                className="mt-4 rounded-md border border-border bg-surface px-4 py-2.5 text-sm"
              >
                Disconnect
              </button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                Connect GitHub to import real repositories and commit history.
              </p>
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/settings" })}
                className="mt-4 rounded-md bg-white px-4 py-2.5 text-sm font-medium !text-black"
              >
                Sign in with GitHub
              </button>
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
            Preferred PNG size: LinkedIn Square (1200×1200). Change per export anytime.
          </p>
        </section>
      </div>
    </div>
  );
}
