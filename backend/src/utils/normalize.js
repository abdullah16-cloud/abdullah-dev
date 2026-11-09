/**
 * Normalization & Sanitization Helpers for user inputs.
 */

/**
 * Normalizes email by trimming and converting to lowercase.
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Normalizes and validates Pakistani mobile phone number format: 03XXXXXXXXX (11 digits).
 */
export function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  // Remove spaces, hyphens, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // If provided with country code +923... or 923...
  if (cleaned.startsWith('+923') && cleaned.length === 13) {
    return '0' + cleaned.substring(3);
  }
  if (cleaned.startsWith('923') && cleaned.length === 12) {
    return '0' + cleaned.substring(2);
  }
  return cleaned;
}

export const PK_PHONE_REGEX = /^03[0-9]{9}$/;
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
