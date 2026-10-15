import type { ReactNode } from "react";

export function StatCard({
  icon,
  label,
  value,
  sub,
  accent = "leaf",
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: "leaf" | "solar" | "sky" | "dune";
}) {
  const accents: Record<string, string> = {
    leaf: "text-leaf-600 dark:text-leaf-400",
    solar: "text-solar-600 dark:text-solar-400",
    sky: "text-sky-600 dark:text-sky-400",
    dune: "text-dune-600 dark:text-dune-300",
  };
  return (
    <div className="card flex items-start gap-3 p-4">
      {icon && <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white dark:bg-white/10 ${accents[accent]}`}>{icon}</span>}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-dune-500 dark:text-dune-400">{label}</p>
        <p className={`text-2xl font-semibold tracking-[-0.02em] ${accents[accent]}`}>{value}</p>
        {sub && <p className="mt-0.5 text-xs text-dune-500 dark:text-dune-400">{sub}</p>}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  label,
  className,
  barClassName,
}: {
  value: number;
  label?: string;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-dune-600 dark:text-dune-300">{label}</span>
        <span className="font-semibold text-dune-800 dark:text-dune-200">{Math.round(value)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white dark:bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-leaf-500 to-leaf-400 transition-all duration-700 ${barClassName ?? ""}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { key: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
              active
                ? "border-leaf-500 bg-leaf-50 shadow-glow dark:border-leaf-400 dark:bg-leaf-950"
                : "border-dune-200 bg-white hover:border-dune-300 dark:border-dune-700 dark:bg-dune-800 dark:hover:border-dune-600"
            }`}
          >
            <span className={`block font-semibold ${active ? "text-leaf-700 dark:text-leaf-300" : "text-dune-800 dark:text-dune-100"}`}>
              {o.label}
            </span>
            {o.hint && <span className="block text-[11px] text-dune-500 dark:text-dune-400">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-dune-500 dark:text-dune-400">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 rounded-xl border border-dune-200 bg-white px-3.5 py-2.5 text-left dark:border-dune-700 dark:bg-dune-800"
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-leaf-500" : "bg-dune-300 dark:bg-dune-600"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
      <span className="text-sm font-medium text-dune-800 dark:text-dune-100">{label}</span>
    </button>
  );
}

export function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group rounded-xl border border-dune-200 bg-white dark:border-dune-700 dark:bg-dune-800" open={defaultOpen}>
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-dune-800 dark:text-dune-100">
        {title}
      </summary>
      <div className="space-y-4 border-t border-dune-100 px-4 py-4 dark:border-dune-700">{children}</div>
    </details>
  );
}

export function Callout({ tone = "info", children }: { tone?: "info" | "warn" | "good"; children: ReactNode }) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200",
    warn: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
    good: "border-leaf-200 bg-leaf-50 text-leaf-900 dark:border-leaf-800 dark:bg-leaf-950 dark:text-leaf-200",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      {children}
    </div>
  );
}
