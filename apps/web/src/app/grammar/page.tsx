import { GrammarLessons } from "@/components/GrammarLessons";
import { PageHeader } from "@/components/PageHeader";

export default function GrammarPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="Short, plain-language lessons on the particles and patterns you'll use every day."
        eyebrow="Grammar"
        title="Grammar that actually makes sense."
      />
      <GrammarLessons />
    </main>
  );
}
