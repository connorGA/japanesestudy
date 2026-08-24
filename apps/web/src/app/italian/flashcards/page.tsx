import { ItalianFlashcardDeck } from "@/components/ItalianFlashcardDeck";

export const metadata = { title: "Italian Flashcards" };

export default function ItalianFlashcardsPage() {
  return (
    <main className="theme-italian mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-5 md:min-h-[calc(100vh-5rem)] md:px-8 md:py-8">
      <ItalianFlashcardDeck />
    </main>
  );
}
