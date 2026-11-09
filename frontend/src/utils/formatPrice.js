/**
 * Formats a monetary value into Pakistani Rupee (PKR) representation.
 * If the value is null, undefined, or not a valid finite number, returns "Price not verified".
 *
 * @param {number|null|undefined} value
 * @returns {string} e.g. "PKR 150,000" or "Price not verified"
 */
export function formatPkr(value) {
  if (
    value === null ||
    value === undefined ||
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return 'Price not verified';
  }

  return `PKR ${new Intl.NumberFormat('en-PK').format(value)}`;
}
