export type HomeOwnership = "RENT" | "MORTGAGE" | "OWN" | "OTHER";
export type LoanIntent =
  | "PERSONAL"
  | "EDUCATION"
  | "MEDICAL"
  | "VENTURE"
  | "HOMEIMPROVEMENT"
  | "DEBTCONSOLIDATION";
export type LoanGrade = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/** Exactly what the FastAPI /predict endpoint expects. */
export interface LoanApplication {
  person_age: number;
  person_income: number;
  person_home_ownership: HomeOwnership;
  person_emp_length: number;
  loan_intent: LoanIntent;
  loan_grade: LoanGrade;
  loan_amnt: number;
  loan_int_rate: number;
  loan_percent_income: number;
  cb_person_default_on_file: "Y" | "N";
  cb_person_cred_hist_length: number;
}

/** What the form edits. loan_percent_income is derived, never typed. */
export type FormState = Omit<LoanApplication, "loan_percent_income">;

export interface PredictionResponse {
  default_probability: number;
  default_prediction: 0 | 1;
  threshold: number;
  Result: "High Risk" | "Low Risk";
}

export type Status = "idle" | "loading" | "success" | "error";