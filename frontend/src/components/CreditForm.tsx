import { useState } from "react";
import { motion } from "framer-motion";
import type { FormState, LoanApplication } from "../types";
import {
  CURRENCY,
  DEFAULT_FORM,
  EXAMPLES,
  GRADE_OPTIONS,
  HOME_OPTIONS,
  INTENT_OPTIONS,
  money,
} from "../options";
import { MoneyField, Segmented, SliderField, Toggle } from "./Inputs";

interface Props {
  loading: boolean;
  onSubmit: (application: LoanApplication) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink/10 pt-8">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const chip =
  "rounded-full border border-ink/15 px-3.5 py-1.5 text-sm transition hover:border-ink/40 hover:bg-surface outline-none focus-visible:ring-2 focus-visible:ring-signal";

export function CreditForm({ loading, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // loan_percent_income is derived from the two fields above, as the model expects (a fraction)
  const ratio = form.person_income > 0 ? form.loan_amnt / form.person_income : 0;
  const valid = form.person_income > 0 && form.loan_amnt > 0;

  return (
    <form
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({ ...form, loan_percent_income: Number(ratio.toFixed(2)) });
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-muted">Start from</span>
        <button type="button" className={chip} onClick={() => setForm(EXAMPLES.steady)}>
          A steady borrower
        </button>
        <button type="button" className={chip} onClick={() => setForm(EXAMPLES.stretched)}>
          A stretched borrower
        </button>
        <button
          type="button"
          className="px-2 py-1.5 text-sm text-muted underline-offset-4 outline-none hover:text-ink hover:underline focus-visible:ring-2 focus-visible:ring-signal"
          onClick={() => setForm(DEFAULT_FORM)}
        >
          Reset
        </button>
      </div>

      <Section title="The applicant">
        <SliderField
          label="Age"
          value={form.person_age}
          min={18}
          max={90}
          format={(n) => `${n} years`}
          onChange={(n) => set("person_age", n)}
        />
        <MoneyField
          label="Yearly income"
          prefix={CURRENCY}
          value={form.person_income}
          onChange={(n) => set("person_income", n)}
        />
        <div className="sm:col-span-2">
          <Segmented
            label="Home"
            value={form.person_home_ownership}
            options={HOME_OPTIONS}
            onChange={(v) => set("person_home_ownership", v)}
          />
        </div>
        <SliderField
          label="Time in current job"
          value={form.person_emp_length}
          min={0}
          max={40}
          format={(n) => (n === 1 ? "1 year" : `${n} years`)}
          onChange={(n) => set("person_emp_length", n)}
        />
      </Section>

      <Section title="Credit history">
        <SliderField
          label="Length of credit history"
          value={form.cb_person_cred_hist_length}
          min={2}
          max={30}
          format={(n) => `${n} years`}
          onChange={(n) => set("cb_person_cred_hist_length", n)}
        />
        <div className="self-end">
          <Toggle
            label="Has defaulted before"
            hint="A past default is on file with the credit bureau"
            checked={form.cb_person_default_on_file === "Y"}
            onChange={(v) => set("cb_person_default_on_file", v ? "Y" : "N")}
          />
        </div>
      </Section>

      <Section title="The loan">
        <div className="sm:col-span-2">
          <Segmented
            label="What it's for"
            grid
            value={form.loan_intent}
            options={INTENT_OPTIONS}
            onChange={(v) => set("loan_intent", v)}
          />
        </div>
        <div className="sm:col-span-2">
          <Segmented
            label="Loan grade"
            value={form.loan_grade}
            options={GRADE_OPTIONS}
            onChange={(v) => set("loan_grade", v)}
          />
        </div>
        <SliderField
          label="Amount"
          value={form.loan_amnt}
          min={500}
          max={40000}
          step={100}
          format={money}
          onChange={(n) => set("loan_amnt", n)}
        />
        <SliderField
          label="Interest rate"
          value={form.loan_int_rate}
          min={5}
          max={25}
          step={0.1}
          format={(n) => `${n.toFixed(1)}%`}
          onChange={(n) => set("loan_int_rate", n)}
        />

        <div className="sm:col-span-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted">Loan as a share of yearly income</span>
            <span className="font-display text-base font-medium tabular-nums">
              {Math.round(ratio * 100)}%
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink/10">
            <motion.div
              className="h-full rounded-full bg-ink"
              animate={{ width: `${Math.min(ratio, 1) * 100}%` }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
            />
          </div>
        </div>
      </Section>

      <div className="flex flex-col gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:items-center">
        <motion.button
          type="submit"
          disabled={!valid || loading}
          whileTap={{ scale: 0.98 }}
          className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-ink px-9 font-display text-lg font-semibold text-surface outline-none transition-colors hover:bg-signal focus-visible:ring-4 focus-visible:ring-signal/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface/30 border-t-surface" />
          )}
          {loading ? "Scoring" : "Run risk check"}
        </motion.button>
        {!valid && (
          <p className="text-sm text-muted">Enter an income and loan amount above 0 to continue.</p>
        )}
      </div>
    </form>
  );
}