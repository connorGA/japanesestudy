import { PageHeader } from "@/components/PageHeader";
import { ProgressDashboard } from "@/components/ProgressDashboard";

export default function ProgressPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 md:px-8">
      <PageHeader
        description="See your mastery across hiragana, katakana, phrases, numbers, sentences, and reviews in one place."
        eyebrow="Progress"
        title="Your learning dashboard."
      />
      <ProgressDashboard />
    </main>
  );
}
