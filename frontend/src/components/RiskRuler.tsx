import { motion } from "framer-motion";
import { percent } from "../options";

interface Props {
  probability?: number;
  threshold?: number;
  tone?: "safe" | "danger";
  scanning?: boolean;
}

const clamp = (n: number) => Math.min(Math.max(n, 0), 1);
const at = (n: number) => `${clamp(n) * 100}%`;
const TICKS = [0, 0.25, 0.5, 0.75, 1];
const BORDER = {
  safe: "var(--color-safe)",
  danger: "var(--color-danger)",
  neutral: "var(--color-ink)",
};

/**
 * A 0-100% ruler. The shaded zones show what the model treats as safe or flagged,
 * the vertical line is its cut-off, and the dot is this application's probability.
 */
export function RiskRuler({ probability, threshold, tone, scanning }: Props) {
  const markerTone = scanning ? "neutral" : tone ?? "neutral";
  const label =
    probability !== undefined && threshold !== undefined
      ? `Default probability ${percent(probability)} against a cut-off of ${percent(threshold)}`
      : "Default probability ruler";

  return (
    <div className="relative h-[92px] w-full select-none" role="img" aria-label={label}>
      {/* track + zones */}
      <div className="absolute inset-x-0 top-[46px] h-3 -translate-y-1/2 overflow-hidden rounded-full bg-ink/10">
        {threshold !== undefined && (
          <>
            <motion.div
              className="absolute inset-y-0 left-0 bg-safe/35"
              initial={{ width: 0 }}
              animate={{ width: at(threshold) }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 bg-danger/35"
              initial={{ width: 0 }}
              animate={{ width: `${(1 - clamp(threshold)) * 100}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </>
        )}
      </div>

      {/* cut-off */}
      {threshold !== undefined && (
        <motion.div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          style={{ left: at(threshold) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="whitespace-nowrap text-xs font-medium">
            Cut-off {percent(threshold)}
          </span>
          <span className="mt-1 h-[52px] w-px bg-ink/60" />
        </motion.div>
      )}

      {/* axis */}
      {TICKS.map((t) => (
        <span
          key={t}
          className="absolute top-[74px] -translate-x-1/2 text-xs tabular-nums text-muted"
          style={{ left: at(t) }}
        >
          {t * 100}%
        </span>
      ))}

      {/* marker */}
      {(probability !== undefined || scanning) && (
        <motion.div
          className="absolute top-[46px] z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-white shadow-md"
          style={{ borderColor: BORDER[markerTone] }}
          initial={{ left: "0%" }}
          animate={scanning ? { left: ["0%", "100%"] } : { left: at(probability ?? 0) }}
          transition={
            scanning
              ? { duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
              : { type: "spring", stiffness: 55, damping: 15, delay: 0.25 }
          }
        />
      )}
    </div>
  );
}