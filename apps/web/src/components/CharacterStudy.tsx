import { Panel } from "./Panel";

type CharacterGroup = {
  label: string;
  items: {
    character: string;
    reading: string;
    note?: string;
  }[];
};

type KanjiItem = {
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  example: string;
};

export function KanaChart({ groups }: { groups: CharacterGroup[] }) {
  return (
    <Panel eyebrow="Chart" title="Characters and Readings">
      <div className="grid gap-5">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-3 font-semibold text-ink">{group.label}</h3>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {group.items.map((item) => (
                <div
                  className="rounded-2xl border border-black/10 bg-washi p-3 text-center"
                  key={`${item.character}-${item.reading}`}
                >
                  <p className="text-3xl font-semibold text-ink">{item.character}</p>
                  <p className="mt-1 text-sm font-semibold text-matcha">{item.reading}</p>
                  {item.note ? <p className="mt-1 text-xs text-slate-500">{item.note}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function KanjiGrid({ items }: { items: KanjiItem[] }) {
  return (
    <Panel eyebrow="Starter set" title="Kanji, Readings, and Examples">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article className="rounded-3xl bg-washi p-5" key={item.character}>
            <div className="flex items-start gap-4">
              <p className="text-5xl font-semibold text-ink">{item.character}</p>
              <div>
                <h3 className="text-lg font-semibold text-ink">{item.meaning}</h3>
                <p className="mt-1 text-sm text-slate-600">On: {item.onyomi}</p>
                <p className="text-sm text-slate-600">Kun: {item.kunyomi}</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-white/80 p-3 text-sm text-slate-700">
              {item.example}
            </p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
