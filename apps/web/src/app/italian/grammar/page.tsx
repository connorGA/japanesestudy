import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const topics = [
  { title: "Gender & articles", idea: "Every noun has a grammatical gender, and its article changes with sound and number.", pattern: "il libro · lo zaino · l'amico · la casa", tip: "Learn each noun with its article—not as a bare word." },
  { title: "Noun plurals", idea: "Most -o nouns become -i, most -a nouns become -e, and most -e nouns become -i.", pattern: "libro → libri · casa → case · notte → notti", tip: "Articles change too: il libro becomes i libri." },
  { title: "Adjective agreement", idea: "Adjectives usually match the gender and number of the noun they describe.", pattern: "ragazzo italiano · ragazze italiane", tip: "Many common adjectives come after the noun." },
  { title: "Essere vs stare", idea: "Essere covers identity and description. Stare often describes wellbeing or staying somewhere.", pattern: "Sono americano. · Sto bene. · Sto a casa.", tip: "For temporary location, standard Italian often still uses essere: Sono a Roma." },
  { title: "C'è and ci sono", idea: "Use c'è for there is and ci sono for there are.", pattern: "C'è un bar. · Ci sono due musei.", tip: "These are essential for describing places." },
  { title: "Prepositions + articles", idea: "A, di, da, in, and su often fuse with definite articles.", pattern: "a + il = al · di + la = della · in + i = nei", tip: "Treat common combinations like al bar and nella città as chunks." },
  { title: "Direct object pronouns", idea: "Lo, la, li, and le replace a known object and usually come before the verb.", pattern: "Vedo il film. → Lo vedo.", tip: "With a past participle, agreement may appear: L'ho vista." },
  { title: "The polite form", idea: "Use Lei with third-person singular verbs when speaking formally to one person.", pattern: "Come stai? → Come sta?", tip: "In writing, Lei may be capitalized for clarity or courtesy." },
];

export const metadata = { title: "Italian Grammar" };

export default function ItalianGrammarPage() {
  return (
    <main className="theme-italian mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-5 md:gap-8 md:px-8 md:py-8">
      <PageHeader eyebrow="Grammar" title="See the patterns behind the language." description="Start with the structures that unlock the most Italian. Each guide gives you a rule, a pattern, and one practical memory cue." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic, index) => (
          <article className="group flex min-h-72 flex-col rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6" key={topic.title}>
            <div className="flex items-center justify-between"><span className="text-xs font-bold tabular-nums text-matcha">LESSON {String(index + 1).padStart(2, "0")}</span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-matcha" /></div>
            <h2 className="mt-5 text-xl font-bold text-ink">{topic.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{topic.idea}</p>
            <p className="mt-5 rounded-2xl bg-washi p-3 text-sm font-semibold leading-6 text-ink">{topic.pattern}</p>
            <p className="mt-auto pt-5 text-xs leading-5 text-slate-500"><span className="font-bold text-matcha">Remember:</span> {topic.tip}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
