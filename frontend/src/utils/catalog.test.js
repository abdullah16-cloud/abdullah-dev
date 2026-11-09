import { describe, it, expect } from 'vitest';
import {
  filterBikes,
  sortBikes,
  parseCatalogParams,
  buildCatalogParams,
  hasActiveFilters,
} from './catalog';

const sampleBikes = [
  {
    id: 'b1',
    name: 'Honda CD 70',
    category: 'commuter',
    availability: 'available',
    pricePkr: 157900,
  },
  {
    id: 'b2',
    name: 'Honda CG 125',
    category: 'standard',
    availability: 'unknown',
    pricePkr: null,
  },
  {
    id: 'b3',
    name: 'Honda CB 150F',
    category: 'sport',
    availability: 'unavailable',
    pricePkr: 499900,
  },
  {
    id: 'b4',
    name: 'Honda Pridor',
    category: 'commuter',
    availability: 'available',
    pricePkr: null,
  },
];

describe('Catalog Utilities - filterBikes', () => {
  it('filters by search term case-insensitively and trimmed', () => {
    const res = filterBikes(sampleBikes, { search: '  cd 70 ' });
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Honda CD 70');
  });

  it('matches search term against category title or slug', () => {
    const res = filterBikes(sampleBikes, { search: 'sport' });
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Honda CB 150F');
  });

  it('filters by category slug', () => {
    const res = filterBikes(sampleBikes, { category: 'commuter' });
    expect(res).toHaveLength(2);
  });

  it('filters by availability', () => {
    const res = filterBikes(sampleBikes, { availability: 'available' });
    expect(res).toHaveLength(2);
  });

  it('returns empty array when search has no match', () => {
    const res = filterBikes(sampleBikes, { search: 'suzuki' });
    expect(res).toHaveLength(0);
  });

  it('returns all bikes when search and filters are empty or "all"', () => {
    const res = filterBikes(sampleBikes, { search: '', category: 'all', availability: 'all' });
    expect(res).toHaveLength(sampleBikes.length);
  });

  it('filters by maxPrice properly and excludes null prices when maxPrice is active', () => {
    const res = filterBikes(sampleBikes, { maxPrice: 200000 });
    expect(res).toHaveLength(1);
    expect(res[0].name).toBe('Honda CD 70');
  });
});

describe('Catalog Utilities - sortBikes', () => {
  it('sorts by name ascending and descending without mutating original array', () => {
    const copy = [...sampleBikes];
    const asc = sortBikes(sampleBikes, 'name-asc');
    expect(asc[0].name).toBe('Honda CB 150F');
    expect(sampleBikes).toEqual(copy);

    const desc = sortBikes(sampleBikes, 'name-desc');
    expect(desc[0].name).toBe('Honda Pridor');
  });

  it('sorts by price asc and desc with null prices ALWAYS at the end', () => {
    const asc = sortBikes(sampleBikes, 'price-asc');
    expect(asc[0].name).toBe('Honda CD 70'); // 157900
    expect(asc[1].name).toBe('Honda CB 150F'); // 499900
    expect(asc[2].pricePkr).toBeNull();
    expect(asc[3].pricePkr).toBeNull();

    const desc = sortBikes(sampleBikes, 'price-desc');
    expect(desc[0].name).toBe('Honda CB 150F'); // 499900
    expect(desc[1].name).toBe('Honda CD 70'); // 157900
    expect(desc[2].pricePkr).toBeNull();
    expect(desc[3].pricePkr).toBeNull();
  });
});

describe('Catalog Utilities - parseCatalogParams & buildCatalogParams', () => {
  it('parses valid URL params correctly', () => {
    const params = new URLSearchParams(
      'search=cg&category=standard&sort=name-asc&availability=available'
    );
    const parsed = parseCatalogParams(params);
    expect(parsed).toEqual({
      search: 'cg',
      category: 'standard',
      sort: 'name-asc',
      availability: 'available',
    });
  });

  it('falls back safely to defaults for invalid params', () => {
    const params = new URLSearchParams('sort=invalid-key&availability=bogus');
    const parsed = parseCatalogParams(params);
    expect(parsed.sort).toBe('');
    expect(parsed.availability).toBe('all');
  });

  it('builds clean URL search params omitting defaults', () => {
    const state = {
      search: 'cd',
      category: 'commuter',
      sort: '',
      availability: 'all',
    };
    const params = buildCatalogParams(state);
    expect(params.get('search')).toBe('cd');
    expect(params.get('category')).toBe('commuter');
    expect(params.has('sort')).toBe(false);
    expect(params.has('availability')).toBe(false);
  });

  it('checks hasActiveFilters correctly', () => {
    expect(hasActiveFilters({ search: '', category: 'all', sort: '', availability: 'all' })).toBe(
      false
    );
    expect(
      hasActiveFilters({ search: 'hello', category: 'all', sort: '', availability: 'all' })
    ).toBe(true);
  });
});
