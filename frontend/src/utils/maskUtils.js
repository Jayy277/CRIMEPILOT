/**
 * Utility to mask sensitive identity card numbers
 * Examples:
 * - Aadhaar: XXXX XXXX 9012
 * - Passport: XXXXX567
 * - Voter ID: XXXXXX4567
 * - Driving License: XXXX-XXXX-12345
 */
export const maskIdentityNumber = (type, number) => {
  if (!number) return 'N/A';
  const clean = String(number).replace(/[\s-]/g, '');

  if (type === 'Aadhaar Card' || (clean.length === 12 && /^\d+$/.test(clean))) {
    const last4 = clean.slice(-4);
    return `XXXX XXXX ${last4}`;
  }
  
  if (type === 'Passport' || (/^[A-Z]\d{7}$/i.test(clean))) {
    const last3 = clean.slice(-3);
    return `XXXXX${last3}`;
  }

  if (type === 'Voter ID' || (/^[A-Z]{3}\d{7}$/i.test(clean))) {
    const last4 = clean.slice(-4);
    return `XXXXXX${last4}`;
  }

  if (type === 'Driving License') {
    const last5 = clean.slice(-5);
    return `XXXX-XXXX-${last5}`;
  }

  if (clean.length > 4) {
    return `${'X'.repeat(clean.length - 4)}${clean.slice(-4)}`;
  }

  return number;
};
