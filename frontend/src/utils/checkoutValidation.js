/**
 * Reusable phone number validation helper for Pakistani phone numbers.
 * Format: 03XXXXXXXXX (11 digits, starts with 03)
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return 'Phone number is required.';
  }
  const trimmed = phone.trim();
  // Standard Pakistan mobile format: 03 followed by 9 digits
  const pkPhoneRegex = /^03\d{9}$/;
  if (!pkPhoneRegex.test(trimmed)) {
    return 'Enter a valid 11-digit Pakistani phone number (e.g. 03001234567).';
  }
  return null;
}
