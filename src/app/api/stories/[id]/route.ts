import { NextResponse } from "next/server";
import { getSharedStory } from "@/lib/share-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const record = await getSharedStory(id);
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}
