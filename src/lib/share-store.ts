import { promises as fs } from "fs";
import path from "path";
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

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function fileFor(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function saveSharedStory(
  story: ProjectStory,
  options?: { id?: string; ownerLogin?: string },
): Promise<SharedStory> {
  await ensureDir();
  const id = options?.id ?? nanoid(10);
  const existing = await getSharedStory(id);
  const record: SharedStory = {
    id,
    story: {
      ...story,
      status: "generated",
      updatedAt: new Date().toISOString(),
    },
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerLogin: options?.ownerLogin ?? existing?.ownerLogin,
  };
  await fs.writeFile(fileFor(id), JSON.stringify(record, null, 2), "utf8");
  return record;
}

export async function getSharedStory(id: string): Promise<SharedStory | null> {
  try {
    const raw = await fs.readFile(fileFor(id), "utf8");
    return JSON.parse(raw) as SharedStory;
  } catch {
    return null;
  }
}

export async function listSharedStories(): Promise<SharedStory[]> {
  try {
    await ensureDir();
    const files = await fs.readdir(DATA_DIR);
    const stories = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const raw = await fs.readFile(path.join(DATA_DIR, f), "utf8");
          return JSON.parse(raw) as SharedStory;
        }),
    );
    return stories.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } catch {
    return [];
  }
}
