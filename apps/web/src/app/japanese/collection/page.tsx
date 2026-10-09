import type { Metadata } from "next";
import { CollectionGrid } from "@/components/game/CollectionGrid";

export const metadata: Metadata = { title: "Collection" };

export default function CollectionPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-5 md:px-8 md:py-8">
      <CollectionGrid />
    </main>
  );
}
