import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import { nanoid } from "nanoid";
import type { ProjectStory } from "./types";

export type SharedStory = {
  id: string;
  story: ProjectStory;
  createdAt: string;
  updatedAt: string;
  ownerLogin?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data", "shares");
const BLOB_ACCESS = "private" as const;

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function isVercel() {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

function blobPath(id: string) {
  return `shares/${id}.json`;
}

function proofBlobBase(id: string) {
  return `shares/${id}/proof`;
}

function fileFor(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function streamToString(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const merged = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

/** Persist a data-URL screenshot to Blob; return an app proxy URL for the browser. */
async function persistProofImage(
  shareId: string,
  proofImage: string | null | undefined,
): Promise<string | null> {
  if (!proofImage) return null;
  if (!proofImage.startsWith("data:image/")) return proofImage;
  if (!isBlobConfigured()) {
    throw new Error(
      "Live links need Vercel Blob when screenshots are uploaded. Add BLOB_READ_WRITE_TOKEN in Vercel, or use an image URL instead of uploading a file.",
    );
  }

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(proofImage);
  if (!match) return proofImage;

  const contentType = match[1]!;
  const buffer = Buffer.from(match[2]!, "base64");
  const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") || "png";
  await put(`${proofBlobBase(shareId)}.${ext}`, buffer, {
    access: BLOB_ACCESS,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    token: blobToken(),
  });
  // Browser cannot read private blob URLs — serve through our API.
  return `/api/shares/${shareId}/proof`;
}

async function saveToBlob(record: SharedStory) {
  await put(blobPath(record.id), JSON.stringify(record), {
    access: BLOB_ACCESS,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: blobToken(),
  });
}

async function getFromBlob(id: string): Promise<SharedStory | null> {
  const result = await get(blobPath(id), {
    access: BLOB_ACCESS,
    token: blobToken(),
    useCache: false,
  });
  if (!result?.stream) return null;

  try {
    const raw = await streamToString(result.stream);
    return JSON.parse(raw) as SharedStory;
  } catch {
    return null;
  }
}

/** Stream a private proof image for a shared story (used by /api/shares/[id]/proof). */
export async function getSharedProofBlob(id: string): Promise<{
  stream: ReadableStream<Uint8Array>;
  contentType: string;
} | null> {
  if (!isBlobConfigured()) return null;

  for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
    const result = await get(`${proofBlobBase(id)}.${ext}`, {
      access: BLOB_ACCESS,
      token: blobToken(),
    });
    if (result?.stream) {
      const contentType =
        result.blob.contentType ||
        result.headers.get("content-type") ||
        `image/${ext === "jpg" ? "jpeg" : ext}`;
      return { stream: result.stream, contentType };
    }
  }
  return null;
}

async function saveToFs(record: SharedStory) {
  await ensureDir();
  await fs.writeFile(fileFor(record.id), JSON.stringify(record, null, 2), "utf8");
}

async function getFromFs(id: string): Promise<SharedStory | null> {
  try {
    const raw = await fs.readFile(fileFor(id), "utf8");
    return JSON.parse(raw) as SharedStory;
  } catch {
    return null;
  }
}

export async function saveSharedStory(
  story: ProjectStory,
  options?: { id?: string; ownerLogin?: string },
): Promise<SharedStory> {
  if (!isBlobConfigured() && isVercel()) {
    throw new Error(
      "Live share links need Vercel Blob. In your Vercel project: Storage → Create Blob → connect it, then redeploy.",
    );
  }

  const id = options?.id ?? nanoid(10);
  const existing = await getSharedStory(id);
  const proofImage = await persistProofImage(id, story.carousel.proofImage);

  const record: SharedStory = {
    id,
    story: {
      ...story,
      status: "generated",
      updatedAt: new Date().toISOString(),
      carousel: {
        ...story.carousel,
        proofImage,
      },
    },
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerLogin: options?.ownerLogin ?? existing?.ownerLogin,
  };

  if (isBlobConfigured()) {
    await saveToBlob(record);
  } else {
    await saveToFs(record);
  }
  return record;
}

export async function getSharedStory(id: string): Promise<SharedStory | null> {
  if (isBlobConfigured()) {
    return getFromBlob(id);
  }
  if (isVercel()) return null;
  return getFromFs(id);
}
