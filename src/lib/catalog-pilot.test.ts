import { describe, expect, it } from 'vitest';

import { catalogIntentSource, isCatalogPilot } from './catalog-pilot';

describe('catalog pilot markers', () => {
  it('identifies DOGE Essentials listings and records the required intent source', () => {
    const product = { brand: 'DOGE Essentials', benefit_label: 'Catálogo piloto' };

    expect(isCatalogPilot(product)).toBe(true);
    expect(catalogIntentSource(product, 'store')).toBe('catalog-pilot');
  });

  it('preserves the non-pilot origin for existing listings', () => {
    const product = { brand: 'DOGE', benefit_label: null };

    expect(isCatalogPilot(product)).toBe(false);
    expect(catalogIntentSource(product, 'product-detail')).toBe('product-detail');
  });
});
