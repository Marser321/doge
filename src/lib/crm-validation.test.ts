import { describe, expect, test } from 'vitest';
import { sanitizeCrmPayload, validateCrmPayload } from './crm-validation';

describe('CRM payload validation', () => {
  test('drops non-whitelisted fields before an update', () => {
    expect(sanitizeCrmPayload('products', { name: 'Vacuum', is_admin: true })).toEqual({ name: 'Vacuum' });
  });
  test('rejects invalid product inventory and client email', () => {
    expect(validateCrmPayload('products', { name: 'Vacuum', slug: 'vacuum', stock_quantity: -1 }, 'create')).toContain('stock');
    expect(validateCrmPayload('clients', { name: 'Ada', email: 'invalid' }, 'create')).toContain('email');
  });
});
