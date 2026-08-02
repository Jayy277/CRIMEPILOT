/**
 * Utility for Date Validation in CrimePilot
 */

// Get current local date in YYYY-MM-DD format
export const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validates start and end dates according to CrimePilot requirements:
 * 1. Start Date cannot be greater than today's date.
 * 2. End Date cannot be greater than today's date.
 * 3. End Date cannot be earlier than Start Date.
 * 
 * Returns { isValid: boolean, error: string }
 */
export const validateDateRange = (startDate, endDate) => {
  const todayStr = getTodayDateString();

  if (startDate && startDate > todayStr) {
    return {
      isValid: false,
      error: "Start Date cannot be greater than today's date."
    };
  }

  if (endDate && endDate > todayStr) {
    return {
      isValid: false,
      error: "End Date cannot be greater than today's date."
    };
  }

  if (startDate && endDate && endDate < startDate) {
    return {
      isValid: false,
      error: "End Date must be greater than or equal to Start Date."
    };
  }

  return { isValid: true, error: "" };
};
