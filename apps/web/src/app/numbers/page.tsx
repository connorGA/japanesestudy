import { NumbersPractice } from "@/components/NumbersPractice";
import { PageHeader } from "@/components/PageHeader";

export default function NumbersPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="Count, tell time, and use everyday counters like ひとつ and ひとり."
        eyebrow="Numbers"
        title="Numbers, time, and counters."
      />
      <NumbersPractice />
    </main>
  );
}
