import { PageHeader } from "@/components/PageHeader";
import { ReviewQueue } from "@/components/ReviewQueue";

export default function ReviewsPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="Spaced repetition keeps phrases, grammar, and sentences in long-term memory."
        eyebrow="Reviews"
        title="Review what you've learned."
      />
      <ReviewQueue />
    </main>
  );
}
