import { NextResponse } from "next/server";
import { auth, isGitHubAuthConfigured } from "@/auth";
import { listUserRepos } from "@/lib/github";

export async function GET() {
  if (!isGitHubAuthConfigured()) {
    return NextResponse.json(
      { error: "GitHub OAuth is not configured. Add AUTH_GITHUB_ID and AUTH_GITHUB_SECRET." },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in with GitHub to load repos." }, { status: 401 });
  }

  if (!session.accessToken) {
    return NextResponse.json(
      {
        error:
          "GitHub token missing from session. Sign out, then sign in with GitHub again to grant repo access.",
      },
      { status: 401 },
    );
  }

  try {
    const repos = await listUserRepos(session.accessToken);
    return NextResponse.json({ repos, count: repos.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load repos";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
