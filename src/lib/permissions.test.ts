import { describe, expect, test } from 'vitest';
import { canAccessCrm } from './permissions';

describe('CRM authorization matrix', () => {
  test('allows dispatchers to manage client intake but not products', () => {
    expect(canAccessCrm('dispatcher', 'clients')).toBe(true);
    expect(canAccessCrm('dispatcher', 'products')).toBe(false);
  });
  test('denies crew access to private CRM resources', () => {
    expect(canAccessCrm('crew', 'orders')).toBe(false);
    expect(canAccessCrm('crew', 'subscriptions')).toBe(false);
  });
});
