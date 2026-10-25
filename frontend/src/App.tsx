import { useRef, useState } from "react";
import { motion } from "framer-motion";
import "./App.css";
import { predict } from "./api";
import type { LoanApplication, PredictionResponse, Status } from "./types";
import { CreditForm } from "./components/CreditForm";
import { PredictionResult } from "./components/PredictionResult";
import { ApiStatus } from "./components/ApiStatus";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--color-ink)" />
      <path d="M8 21v-4M12 21v-2M16 21v-4M20 21v-2" stroke="#fff" strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21" cy="12" r="3.5" fill="#fff" />
    </svg>
  );
}

export default function App() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<PredictionResponse>();
  const [application, setApplication] = useState<LoanApplication>();
  const [error, setError] = useState<string>();
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  async function run(app: LoanApplication) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setApplication(app);
    setError(undefined);
    setStatus("loading");

    // On small screens the result sits below the form, so bring it into view
    if (window.matchMedia("(max-width: 1023px)").matches) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    try {
      // A short minimum wait keeps the scanning animation from flashing by
      const [data] = await Promise.all([predict(app, controller.signal), wait(900)]);
      setResult(data);
      setStatus("success");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError((err as Error).message);
      setStatus("error");
    }
  }

  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-display text-lg font-semibold tracking-tight">Credit Risk</span>
        </div>
        <ApiStatus />
      </header>

      <motion.main
        className="mx-auto max-w-6xl px-6 pb-24 pt-14 sm:pt-20"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
            How likely is this applicant to default?
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Enter the loan application. The model returns a probability of default and shows
            where it sits against its decision cut-off.
          </p>
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16">
          <CreditForm loading={status === "loading"} onSubmit={run} />
          <aside ref={resultRef} className="scroll-mt-6 lg:sticky lg:top-8 lg:self-start">
            <PredictionResult
              status={status}
              result={result}
              application={application}
              error={error}
              onRetry={() => application && run(application)}
            />
          </aside>
        </div>
      </motion.main>
    </>
  );
}