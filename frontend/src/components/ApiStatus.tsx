import { useEffect, useState } from "react";
import { checkHealth } from "../api";

type State = "checking" | "online" | "offline";

const DOT: Record<State, string> = {
  checking: "bg-muted/50",
  online: "bg-safe",
  offline: "bg-danger",
};
const TEXT: Record<State, string> = {
  checking: "Checking model",
  online: "Model online",
  offline: "Model offline",
};

export function ApiStatus() {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const ok = await checkHealth();
      if (alive) setState(ok ? "online" : "offline");
    };
    check();
    const id = setInterval(check, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-surface px-3.5 py-1.5 text-sm">
      <span className="relative flex h-2 w-2">
        {state === "online" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-60" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${DOT[state]}`} />
      </span>
      {TEXT[state]}
    </div>
  );
}