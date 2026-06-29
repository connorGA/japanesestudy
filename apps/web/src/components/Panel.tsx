import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type PanelProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, eyebrow, children, className }: PanelProps) {
  return (
    <section
      className={twMerge(
        "rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-matcha">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mb-4 text-xl font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}
