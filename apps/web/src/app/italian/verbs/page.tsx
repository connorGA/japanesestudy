import { ItalianVerbTrainer } from "@/components/ItalianVerbTrainer";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Italian Verbs" };

export default function ItalianVerbsPage() {
  return <main className="theme-italian mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8"><PageHeader eyebrow="Verb lab" title="Conjugate the verbs that power conversation." description="Compare regular endings with the irregular verbs you will use every day. Tap any form to hear it in Italian." /><ItalianVerbTrainer /></main>;
}
