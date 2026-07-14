import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveSharedStory } from "@/lib/share-store";
import type { ProjectStory } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    story?: ProjectStory;
    shareId?: string;
  };

  if (!body.story) {
    return NextResponse.json({ error: "story is required" }, { status: 400 });
  }

  const session = await auth();
  const record = await saveSharedStory(body.story, {
    id: body.shareId,
    ownerLogin: session?.user?.login,
  });

  const origin = new URL(request.url).origin;
  return NextResponse.json({
    id: record.id,
    url: `${origin}/s/${record.id}`,
    path: `/s/${record.id}`,
  });
}
