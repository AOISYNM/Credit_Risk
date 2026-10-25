import type {
  FormState,
  HomeOwnership,
  LoanGrade,
  LoanIntent,
} from "./types";

export const CURRENCY = "$";

export const money = (n: number) =>
  `${CURRENCY}${Math.round(n).toLocaleString("en-US")}`;

/** 0.1234 -> "12.3%" */
export const percent = (fraction: number, digits = 1) =>
  `${Number((fraction * 100).toFixed(digits))}%`;

export const HOME_OPTIONS: { value: HomeOwnership; label: string }[] = [
  { value: "RENT", label: "Rent" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OWN", label: "Own" },
  { value: "OTHER", label: "Other" },
];

export const INTENT_OPTIONS: { value: LoanIntent; label: string }[] = [
  { value: "PERSONAL", label: "Personal" },
  { value: "EDUCATION", label: "Education" },
  { value: "MEDICAL", label: "Medical" },
  { value: "VENTURE", label: "Business" },
  { value: "HOMEIMPROVEMENT", label: "Home repairs" },
  { value: "DEBTCONSOLIDATION", label: "Debt consolidation" },
];

export const INTENT_LABELS = Object.fromEntries(
  INTENT_OPTIONS.map((o) => [o.value, o.label])
) as Record<LoanIntent, string>;

export const GRADE_OPTIONS = (["A", "B", "C", "D", "E", "F", "G"] as LoanGrade[]).map(
  (g) => ({ value: g, label: g })
);

export const DEFAULT_FORM: FormState = {
  person_age: 30,
  person_income: 60000,
  person_home_ownership: "RENT",
  person_emp_length: 5,
  loan_intent: "PERSONAL",
  loan_grade: "B",
  loan_amnt: 10000,
  loan_int_rate: 11,
  cb_person_default_on_file: "N",
  cb_person_cred_hist_length: 6,
};

export const EXAMPLES: Record<"steady" | "stretched", FormState> = {
  steady: {
    person_age: 38,
    person_income: 92000,
    person_home_ownership: "MORTGAGE",
    person_emp_length: 11,
    loan_intent: "HOMEIMPROVEMENT",
    loan_grade: "A",
    loan_amnt: 8000,
    loan_int_rate: 7.5,
    cb_person_default_on_file: "N",
    cb_person_cred_hist_length: 14,
  },
  stretched: {
    person_age: 23,
    person_income: 28000,
    person_home_ownership: "RENT",
    person_emp_length: 1,
    loan_intent: "MEDICAL",
    loan_grade: "E",
    loan_amnt: 18000,
    loan_int_rate: 17.8,
    cb_person_default_on_file: "Y",
    cb_person_cred_hist_length: 3,
  },
};