import { ItalianListeningHub } from "@/components/ItalianListeningHub";

export const metadata = { title: "Spanish Listening" };

export default function SpanishListeningPage() {
  return <main className="theme-spanish flex w-full flex-col px-4 py-5 sm:px-5 sm:py-6 md:min-h-[calc(100svh-5.5rem)] md:px-6 lg:h-[calc(100svh-5.5rem)] lg:overflow-hidden"><ItalianListeningHub language="spanish" /></main>;
}
