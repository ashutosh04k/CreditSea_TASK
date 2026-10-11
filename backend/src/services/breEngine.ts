export interface BRERequest {
  dob: string; // YYYY-MM-DD
  monthlySalary: number;
  pan: string;
  employmentMode: 'Salaried' | 'Self-Employed' | 'Unemployed';
}

export interface BREResult {
  isValid: boolean;
  errors: string[];
  calculatedAge?: number;
}

export const validateBRE = (data: BRERequest): BREResult => {
  const errors: string[] = [];

  // 1. Calculate Age
  let age = 0;
  if (!data.dob) {
    errors.push('Date of Birth is required.');
  } else {
    const dobDate = new Date(data.dob);
    if (isNaN(dobDate.getTime())) {
      errors.push('Invalid Date of Birth format.');
    } else {
      const today = new Date();
      age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }

      if (age < 23 || age > 50) {
        errors.push(`Age must be between 23 and 50 years. (Your age: ${age})`);
      }
    }
  }

  // 2. Salary Check
  if (typeof data.monthlySalary !== 'number' || isNaN(data.monthlySalary)) {
    errors.push('Monthly salary must be a valid number.');
  } else if (data.monthlySalary < 25000) {
    errors.push(`Monthly salary must be at least ₹25,000. (Provided: ₹${data.monthlySalary.toLocaleString('en-IN')})`);
  }

  // 3. PAN Format Regex
  // PAN regex format: 5 uppercase letters, 4 digits, 1 uppercase letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const cleanPan = (data.pan || '').trim().toUpperCase();
  if (!panRegex.test(cleanPan)) {
    errors.push('PAN number does not match valid PAN format (e.g., ABCDE1234F).');
  }

  // 4. Employment Check
  if (!data.employmentMode) {
    errors.push('Employment mode is required.');
  } else if (data.employmentMode === 'Unemployed') {
    errors.push('Applicant cannot be Unemployed to apply for a loan.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    calculatedAge: age,
  };
};
