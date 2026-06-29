import { PageHeader } from "@/components/PageHeader";
import { TutorChat } from "@/components/TutorChat";

export default function TutorPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="Pick a category, put on headphones, and hear English-to-Japanese drills play continuously."
        eyebrow="Passive listening"
        title="Drill vocabulary while you walk, cook, or take a break."
      />
      <TutorChat />
    </main>
  );
}
