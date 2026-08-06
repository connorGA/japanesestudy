import { KanjiLibrary } from "@/components/KanjiLibrary";
import { PageHeader } from "@/components/PageHeader";

export default function KanjiPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8">
      <PageHeader
        description="Start with high-frequency characters, then connect each one to readings and useful vocabulary."
        eyebrow="Kanji"
        title="Build meaning from characters."
      />
      <KanjiLibrary />
    </main>
  );
}
