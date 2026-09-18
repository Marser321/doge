import type { ComponentType, ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
  neutral: 'border-white/10 bg-white/[0.04] text-zinc-300',
  info: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  warning: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  danger: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
};

export function CrmPageIntro({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-200/80">{eyebrow}</p>
        <h1 className="mt-2 font-michroma text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function CrmMetricCard({ label, value, icon: Icon, href }: { label: string; value: ReactNode; icon: ComponentType<LucideProps>; href?: string }) {
  const content = <><div className="flex items-center justify-between"><p className="text-xs font-medium text-zinc-400">{label}</p><span className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><Icon className="size-4 text-sky-200" /></span></div><p className="mt-5 font-mono text-3xl font-semibold text-white">{value}</p></>;
  const className = 'rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-sky-400/25 hover:bg-white/[0.05]';
  return href ? <a href={href} className={className}>{content}</a> : <div className={className}>{content}</div>;
}

export function CrmStatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>{children}</span>;
}

export function CrmEmptyState({ icon: Icon, title, detail }: { icon: ComponentType<LucideProps>; title: string; detail: string }) {
  return <div className="grid min-h-56 place-items-center px-6 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.03]"><Icon className="size-5 text-zinc-500" /></span><p className="mt-4 text-sm font-medium text-zinc-300">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500">{detail}</p></div></div>;
}
