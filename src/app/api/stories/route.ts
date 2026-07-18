import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSharedStory, saveSharedStory } from "@/lib/share-store";
import type { ProjectStory } from "@/lib/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.login) {
    return NextResponse.json({ error: "Sign in required to publish a live link." }, { status: 401 });
  }

  const body = (await request.json()) as {
    story?: ProjectStory;
    shareId?: string;
  };

  if (!body.story) {
    return NextResponse.json({ error: "story is required" }, { status: 400 });
  }

  if (body.shareId) {
    const existing = await getSharedStory(body.shareId);
    if (existing?.ownerLogin && existing.ownerLogin !== session.user.login) {
      return NextResponse.json({ error: "You do not own this share link." }, { status: 403 });
    }
  }

  const record = await saveSharedStory(body.story, {
    id: body.shareId,
    ownerLogin: session.user.login,
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json({
    id: record.id,
    url: `${origin}/s/${record.id}`,
    path: `/s/${record.id}`,
  });
}
