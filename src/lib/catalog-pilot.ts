import type { Product } from '@/lib/types';

export const CATALOG_PILOT_LABEL = 'Catálogo piloto';

export function isCatalogPilot(product: Pick<Product, 'benefit_label' | 'brand'>) {
  return product.benefit_label === CATALOG_PILOT_LABEL || product.brand === 'DOGE Essentials';
}

export function catalogIntentSource(product: Pick<Product, 'benefit_label' | 'brand'>, source: string) {
  return isCatalogPilot(product) ? 'catalog-pilot' : source;
}
