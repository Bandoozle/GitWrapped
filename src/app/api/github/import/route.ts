import { NextResponse } from "next/server";
import { auth, isGitHubAuthConfigured } from "@/auth";
import { importRepoStory } from "@/lib/github";

export async function POST(request: Request) {
  if (!isGitHubAuthConfigured()) {
    return NextResponse.json(
      { error: "GitHub OAuth is not configured." },
      { status: 503 },
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.accessToken) {
    return NextResponse.json(
      {
        error: "GitHub token missing. Sign out and sign in with GitHub again.",
      },
      { status: 401 },
    );
  }

  const body = (await request.json()) as { fullName?: string };
  if (!body.fullName) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  try {
    const story = await importRepoStory(body.fullName, session.accessToken);
    return NextResponse.json({ story });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
