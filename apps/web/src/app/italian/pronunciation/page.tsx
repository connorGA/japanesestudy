import { ItalianPronunciation } from "@/components/ItalianPronunciation";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Italian Pronunciation" };

export default function ItalianPronunciationPage() {
  return (
    <main className="theme-italian mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8">
      <PageHeader eyebrow="Pronunciation" title="Make every Italian sound count." description="Italian spelling is wonderfully consistent. Learn the few high-impact sound rules, then tap any example to hear it aloud." />
      <ItalianPronunciation />
    </main>
  );
}
