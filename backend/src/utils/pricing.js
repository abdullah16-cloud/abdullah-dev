/**
 * Currency & Pricing Calculations Utility.
 * Uses integer math (cents/paisas: value * 100) to prevent IEEE-754 floating-point inaccuracies.
 */

/**
 * Converts a decimal monetary value or string to integer paisas (rupees * 100).
 */
export function toPaisa(amount) {
  if (amount === null || amount === undefined || amount === '') return null;
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return null;
  return Math.round(num * 100);
}

/**
 * Converts integer paisas back to a standard rupee number (with up to 2 decimal places).
 */
export function fromPaisa(paisa) {
  if (paisa === null || paisa === undefined) return null;
  return Math.round(paisa) / 100;
}

/**
 * Computes order pricing breakdown with integer precision.
 * 
 * Rules from Phase 6, 8, & 9:
 * - If ANY item has a NULL price, or if delivery charge is NULL:
 *   -> isPriceFinal = false
 *   -> totalPkr = null (marked as "to be confirmed before dispatch")
 * - If ALL items have verified prices AND delivery charge is verified:
 *   -> isPriceFinal = true
 *   -> totalPkr = subtotalPkr + deliveryFeePkr
 */
export function calculateOrderPricing(items, deliveryChargeRupees = null) {
  let anyItemUnpriced = false;
  let subtotalPaisa = 0;
  let hasAtLeastOnePricedItem = false;

  const processedItems = items.map((item) => {
    const unitPricePaisa = toPaisa(item.unitPricePkr);
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

    if (unitPricePaisa === null) {
      anyItemUnpriced = true;
      return {
        ...item,
        unitPricePkr: null,
        quantity,
        lineTotalPkr: null,
      };
    }

    const lineTotalPaisa = unitPricePaisa * quantity;
    subtotalPaisa += lineTotalPaisa;
    hasAtLeastOnePricedItem = true;

    return {
      ...item,
      unitPricePkr: fromPaisa(unitPricePaisa),
      quantity,
      lineTotalPkr: fromPaisa(lineTotalPaisa),
    };
  });

  const deliveryPaisa = toPaisa(deliveryChargeRupees);
  const isDeliveryPriced = deliveryPaisa !== null;

  const subtotalPkr = hasAtLeastOnePricedItem ? fromPaisa(subtotalPaisa) : null;
  const deliveryFeePkr = isDeliveryPriced ? fromPaisa(deliveryPaisa) : 0;

  const isPriceFinal = !anyItemUnpriced && isDeliveryPriced && items.length > 0;
  const totalPkr = isPriceFinal ? fromPaisa(subtotalPaisa + deliveryPaisa) : null;

  return {
    items: processedItems,
    subtotalPkr,
    deliveryFeePkr: isDeliveryPriced ? deliveryFeePkr : null,
    totalPkr,
    isPriceFinal,
  };
}
