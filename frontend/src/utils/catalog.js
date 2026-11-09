/**
 * Pure utility functions for catalog filtering, sorting, and URL param management.
 * These are kept outside of React components so they can be unit-tested easily.
 */

const VALID_SORT_KEYS = ['name-asc', 'name-desc', 'price-asc', 'price-desc'];
const VALID_AVAILABILITY = ['all', 'available', 'unavailable', 'unknown'];

/**
 * Filter bikes by search term, category, availability, and max price.
 *
 * maxPrice behavior:
 * - When maxPrice is null/undefined/empty: ALL bikes are shown (including those with null price).
 * - When maxPrice is a number: only bikes with a verified numeric price <= maxPrice are shown.
 *   Bikes with null price are EXCLUDED when a price filter is active, because we cannot
 *   guarantee they fall within the user's budget. This is a conservative, honest approach.
 */
export function filterBikes(
  bikes,
  { search = '', category = '', availability = 'all', maxPrice = null } = {}
) {
  let result = [...bikes];

  // Search filter: case-insensitive, trimmed, matches name and category
  const trimmedSearch = (search || '').trim().toLowerCase();
  if (trimmedSearch) {
    result = result.filter((bike) => {
      const nameMatch = bike.name.toLowerCase().includes(trimmedSearch);
      const categoryMatch = bike.category.toLowerCase().includes(trimmedSearch);
      return nameMatch || categoryMatch;
    });
  }

  // Category filter: matches slug; "all" or empty means no filter
  if (category && category !== 'all') {
    result = result.filter((bike) => bike.category === category);
  }

  // Availability filter
  if (availability && availability !== 'all') {
    result = result.filter((bike) => bike.availability === availability);
  }

  // Max price filter
  if (maxPrice !== null && maxPrice !== undefined && maxPrice !== '') {
    const maxPriceNum = Number(maxPrice);
    if (Number.isFinite(maxPriceNum) && maxPriceNum > 0) {
      result = result.filter((bike) => {
        if (bike.pricePkr === null || bike.pricePkr === undefined) {
          return false; // Exclude unverified prices when price filter is active
        }
        return bike.pricePkr <= maxPriceNum;
      });
    }
  }

  return result;
}

/**
 * Sort bikes by the given sort key.
 * For price sorts, bikes with null price ALWAYS go to the end in both directions.
 * Does not mutate the original array.
 */
export function sortBikes(bikes, sortKey) {
  const sorted = [...bikes];

  switch (sortKey) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;

    case 'price-asc':
      sorted.sort((a, b) => {
        const aNull = a.pricePkr === null || a.pricePkr === undefined;
        const bNull = b.pricePkr === null || b.pricePkr === undefined;
        if (aNull && bNull) return 0;
        if (aNull) return 1; // null goes to end
        if (bNull) return -1;
        return a.pricePkr - b.pricePkr;
      });
      break;

    case 'price-desc':
      sorted.sort((a, b) => {
        const aNull = a.pricePkr === null || a.pricePkr === undefined;
        const bNull = b.pricePkr === null || b.pricePkr === undefined;
        if (aNull && bNull) return 0;
        if (aNull) return 1; // null goes to end
        if (bNull) return -1;
        return b.pricePkr - a.pricePkr;
      });
      break;

    default:
      // No sort, return copy in original order
      break;
  }

  return sorted;
}

/**
 * Parse URL search params into a normalized filter state object.
 * Invalid values safely fall back to defaults.
 */
export function parseCatalogParams(searchParams) {
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || '';
  const availability = searchParams.get('availability') || 'all';

  return {
    search: search.trim(),
    category,
    sort: VALID_SORT_KEYS.includes(sort) ? sort : '',
    availability: VALID_AVAILABILITY.includes(availability) ? availability : 'all',
  };
}

/**
 * Build URL search params from a filter state object.
 * Only includes non-default values to keep URLs clean.
 */
export function buildCatalogParams(state) {
  const params = new URLSearchParams();

  if (state.search && state.search.trim()) {
    params.set('search', state.search.trim());
  }
  if (state.category && state.category !== 'all') {
    params.set('category', state.category);
  }
  if (state.sort && VALID_SORT_KEYS.includes(state.sort)) {
    params.set('sort', state.sort);
  }
  if (state.availability && state.availability !== 'all') {
    params.set('availability', state.availability);
  }

  return params;
}

/**
 * Check if any filters are active (non-default).
 */
export function hasActiveFilters(state) {
  return !!(
    (state.search && state.search.trim()) ||
    (state.category && state.category !== 'all') ||
    (state.sort && state.sort !== '') ||
    (state.availability && state.availability !== 'all')
  );
}
