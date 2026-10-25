import type { LoanApplication, PredictionResponse } from "./types";

export const API_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function predict(
  application: LoanApplication,
  signal?: AbortSignal
): Promise<PredictionResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new Error(
      `Can't reach the scoring service at ${API_URL}. Start the API and try again.`
    );
  }

  if (!res.ok) {
    throw new Error(
      res.status === 422
        ? "The service rejected one of the values. Check the fields and try again."
        : `The scoring service returned an error (${res.status}).`
    );
  }
  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/`, { signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
}