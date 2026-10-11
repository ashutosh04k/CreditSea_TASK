export interface LoanCalculationResult {
  principal: number;
  tenureDays: number;
  annualInterestRate: number;
  simpleInterest: number;
  totalRepayment: number;
}

export const calculateLoanMath = (principal: number, tenureDays: number, annualInterestRate = 12): LoanCalculationResult => {
  const P = Math.max(0, principal);
  const T = Math.max(0, tenureDays);
  const R = annualInterestRate;

  // SI = (P * R * T) / (365 * 100)
  const rawInterest = (P * R * T) / (365 * 100);
  const simpleInterest = Math.round(rawInterest * 100) / 100; // round to 2 decimals
  const totalRepayment = Math.round((P + simpleInterest) * 100) / 100;

  return {
    principal: P,
    tenureDays: T,
    annualInterestRate: R,
    simpleInterest,
    totalRepayment,
  };
};
