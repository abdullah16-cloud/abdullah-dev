/**
 * Application Constants & Allowed Domain Values.
 * Directly corresponds with database constraints and frontend expectations.
 */

export const ORDER_STATUSES = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

export const PAYMENT_METHODS = ['cod', 'bank_transfer'];

export const USER_ROLES = ['customer', 'admin', 'staff'];

export const AVAILABILITY_STATES = ['in_stock', 'out_of_stock', 'coming_soon', 'unknown'];

export const ALLOWED_SORT_OPTIONS = ['name-asc', 'name-desc', 'price-asc', 'price-desc'];

/**
 * Valid order status lifecycle transitions.
 * Used in admin order status updates for immediate friendly validation.
 */
export const ORDER_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['dispatched', 'cancelled'],
  dispatched: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};
