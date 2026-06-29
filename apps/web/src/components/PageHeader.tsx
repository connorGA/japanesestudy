import { type ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="rounded-[2rem] border border-black/10 bg-white/75 p-8 shadow-sm backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-matcha">
        {eyebrow}
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        <div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
            {description}
          </p>
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    </section>
  );
}
