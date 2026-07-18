import { getSharedProofBlob } from "@/lib/share-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const proof = await getSharedProofBlob(id);
  if (!proof) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(proof.stream, {
    headers: {
      "Content-Type": proof.contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
