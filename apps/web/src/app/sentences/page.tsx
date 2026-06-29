import { PageHeader } from "@/components/PageHeader";
import { SentenceBuilder } from "@/components/SentenceBuilder";

export default function SentencesPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="Pick the right words and particles to build real Japanese sentences."
        eyebrow="Sentences"
        title="Build sentences piece by piece."
      />
      <SentenceBuilder />
    </main>
  );
}
