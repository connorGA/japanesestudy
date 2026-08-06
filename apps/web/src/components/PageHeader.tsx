import { type ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="rounded-[2rem] border border-black/10 bg-white/75 p-5 shadow-sm backdrop-blur sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-matcha sm:text-sm">
        {eyebrow}
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        <div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:mt-5 sm:text-lg sm:leading-8">
            {description}
          </p>
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    </section>
  );
}
