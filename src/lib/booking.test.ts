import { describe, expect, test } from 'vitest';
import { validateBookingFields } from './booking';

const valid = {
  name: 'Ada Lovelace', email: 'ada@example.com', phone: '+1 305 555 0101',
  address: '1 Ocean Drive', city: 'Miami', property_type: 'Residencial', service_type: 'Limpieza profunda', consent: true,
};

describe('booking validation', () => {
  test('accepts a complete request', () => expect(validateBookingFields(valid)).toBeNull());
  test('rejects a malformed email', () => expect(validateBookingFields({ ...valid, email: 'not-an-email' })).toContain('email'));
  test('requires service and property information', () => expect(validateBookingFields({ ...valid, service_type: '' })).toContain('propiedad'));
  test('requires explicit data-processing consent', () => expect(validateBookingFields({ ...valid, consent: false })).toContain('autorizar'));
});
