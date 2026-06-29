import { PageHeader } from "@/components/PageHeader";
import { PhrasePacks } from "@/components/PhrasePacks";

export default function PhrasesPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="Learn useful Japanese by situation — greetings, survival phrases, ordering food, and more."
        eyebrow="Phrases"
        title="Beginner phrase packs."
      />
      <PhrasePacks />
    </main>
  );
}
