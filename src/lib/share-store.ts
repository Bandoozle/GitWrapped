import { promises as fs } from "fs";
import path from "path";
import { list, put } from "@vercel/blob";
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

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function isVercel() {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

function blobPath(id: string) {
  return `shares/${id}.json`;
}

function fileFor(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/** Persist a data-URL screenshot to Blob so share JSON stays small. */
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
  const blob = await put(`shares/${shareId}/proof.${ext}`, buffer, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}

async function saveToBlob(record: SharedStory) {
  await put(blobPath(record.id), JSON.stringify(record), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

async function getFromBlob(id: string): Promise<SharedStory | null> {
  const pathname = blobPath(id);
  const { blobs } = await list({
    prefix: pathname,
    limit: 10,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  const match = blobs.find((b) => b.pathname === pathname);
  if (!match) return null;

  const res = await fetch(match.url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as SharedStory;
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
