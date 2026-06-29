import { LearningPath } from "@/components/LearningPath";
import { PageHeader } from "@/components/PageHeader";

export default function PathPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="A guided 10-step path from hiragana to reviews — follow it day by day."
        eyebrow="Learning path"
        title="Your first week of Japanese."
      />
      <LearningPath />
    </main>
  );
}
