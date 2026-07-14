import Link from "next/link";
import { notFound } from "next/navigation";
import { getSharedStory } from "@/lib/share-store";
import { SharedCarouselViewer } from "@/components/carousel/shared-viewer";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getSharedStory(id);
  if (!record) notFound();

  return (
    <div className="relative z-10 min-h-screen px-6 py-10">
      <header className="mx-auto mb-10 flex max-w-3xl items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          GitWrapped
        </Link>
        <Link
          href="/story/new"
          className="text-sm text-muted transition hover:text-foreground"
        >
          Make yours →
        </Link>
      </header>
      <SharedCarouselViewer story={record.story} />
    </div>
  );
}
