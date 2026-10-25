import { useId, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";

/* ---------- Field wrapper ---------- */

interface FieldProps {
  label: string;
  htmlFor?: string;
  value?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, value, hint, children }: FieldProps) {
  const Label = htmlFor ? "label" : "span";
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <Label
          {...(htmlFor ? { htmlFor } : {})}
          className="text-sm font-medium text-ink"
        >
          {label}
        </Label>
        {value !== undefined && (
          <span className="font-display text-base font-medium tabular-nums">
            {value}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

/* ---------- Slider ---------- */

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (n: number) => string;
  onChange: (n: number) => void;
  hint?: string;
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
  hint,
}: SliderFieldProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <Field label={label} htmlFor={id} value={format(value)} hint={hint}>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </Field>
  );
}

/* ---------- Money input ---------- */

interface MoneyFieldProps {
  label: string;
  value: number;
  prefix: string;
  onChange: (n: number) => void;
  hint?: string;
}

export function MoneyField({ label, value, prefix, onChange, hint }: MoneyFieldProps) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="flex items-center rounded-xl border border-ink/10 bg-surface px-4 transition focus-within:border-signal focus-within:ring-4 focus-within:ring-signal/15">
        <span className="text-muted">{prefix}</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={value ? value.toLocaleString("en-US") : ""}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            onChange(digits ? Math.min(Number(digits), 1_000_000_000) : 0);
          }}
          className="w-full bg-transparent py-3 pl-2 font-display text-lg tabular-nums outline-none placeholder:text-muted/40"
        />
      </div>
    </Field>
  );
}

/* ---------- Segmented control ---------- */

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  grid?: boolean;
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  grid,
}: SegmentedProps<T>) {
  const pill = useId();
  return (
    <Field label={label}>
      <div
        role="radiogroup"
        aria-label={label}
        className={
          grid
            ? "grid grid-cols-2 gap-1 rounded-2xl bg-ink/[0.06] p-1 sm:grid-cols-3"
            : "flex gap-1 rounded-2xl bg-ink/[0.06] p-1"
        }
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className="relative flex-1 rounded-xl px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-signal"
            >
              {active && (
                <motion.span
                  layoutId={pill}
                  className="absolute inset-0 rounded-xl bg-surface shadow-[0_1px_2px_rgba(18,26,46,0.14),0_0_0_1px_rgba(18,26,46,0.05)]"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span
                className={`relative transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}

/* ---------- Switch ---------- */

interface ToggleProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, hint, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-6 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-danger" : "bg-ink/15"
        }`}
      >
        <motion.span
          className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 34 }}
        />
      </span>
    </button>
  );
}