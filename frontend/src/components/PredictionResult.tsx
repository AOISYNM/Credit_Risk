import { useEffect } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { LoanApplication, PredictionResponse, Status } from "../types";
import { INTENT_LABELS, money, percent } from "../options";
import { RiskRuler } from "./Riskruler";

interface Props {
  status: Status;
  result?: PredictionResponse;
  application?: LoanApplication;
  error?: string;
  onRetry: () => void;
}

const TONES = {
  safe: { text: "text-safe", panel: "border-safe/30 bg-safe/10" },
  danger: { text: "text-danger", panel: "border-danger/30 bg-danger/10" },
} as const;

function CountUp({ to }: { to: number }) {
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => v.toFixed(1));
  useEffect(() => {
    const controls = animate(value, to, { duration: 1.3, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [to, value]);
  return <motion.span>{text}</motion.span>;
}

function Snapshot({ app }: { app: LoanApplication }) {
  const rows: [string, string][] = [
    ["Loan", `${money(app.loan_amnt)} for ${INTENT_LABELS[app.loan_intent].toLowerCase()}`],
    ["Share of income", percent(app.loan_percent_income, 0)],
    ["Interest rate", `${app.loan_int_rate.toFixed(1)}% (grade ${app.loan_grade})`],
    ["Credit history", `${app.cb_person_cred_hist_length} years`],
    ["Past default", app.cb_person_default_on_file === "Y" ? "Yes" : "No"],
  ];
  return (
    <dl className="divide-y divide-ink/10 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-6 py-2.5">
          <dt className="text-muted">{k}</dt>
          <dd className="text-right font-medium tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PredictionResult({ status, result, application, error, onRetry }: Props) {
  const high = result?.default_prediction === 1;
  const tone = high ? "danger" : "safe";

  const panelClass =
    status === "success"
      ? TONES[tone].panel
      : status === "error"
      ? TONES.danger.panel
      : status === "idle"
      ? "border-dashed border-ink/20 bg-transparent"
      : "border-ink/10 bg-surface";

  return (
    <div
      aria-live="polite"
      className={`min-h-[440px] rounded-3xl border p-7 transition-colors duration-700 sm:p-8 ${panelClass}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Your result appears here
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Fill in the application and run the check. You'll see the estimated chance of
              default and where it falls against the model's cut-off.
            </p>
            <div className="mt-14">
              <RiskRuler />
            </div>
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Scoring the application
            </h2>
            <p className="mt-2 text-sm text-muted">Sending the details to the model.</p>
            <div className="mt-14">
              <RiskRuler scanning />
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="font-display text-2xl font-semibold tracking-tight text-danger">
              Couldn't get a result
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-6 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-surface outline-none transition-colors hover:bg-signal focus-visible:ring-4 focus-visible:ring-signal/30"
            >
              Try again
            </button>
          </motion.div>
        )}

        {status === "success" && result && application && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2
              className={`font-display text-6xl font-semibold leading-none tracking-tight ${TONES[tone].text}`}
            >
              {high ? "High risk" : "Low risk"}
            </h2>
            <p className="mt-5 font-display text-2xl tabular-nums">
              <CountUp to={result.default_probability * 100} />% chance of default
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              {high
                ? `That's above the model's ${percent(result.threshold)} cut-off, so the application is flagged.`
                : `That's below the model's ${percent(result.threshold)} cut-off, so the application isn't flagged.`}
            </p>

            <div className="mt-10">
              <RiskRuler
                probability={result.default_probability}
                threshold={result.threshold}
                tone={tone}
              />
            </div>

            <div className="mt-6">
              <Snapshot app={application} />
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted">
              This is a model estimate to support a decision, not the decision itself.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}