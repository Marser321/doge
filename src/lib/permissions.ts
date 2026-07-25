import type { StaffRole } from './types';

export const CRM_ROLE_MATRIX = {
  clients: ['owner', 'manager', 'dispatcher'],
  subscriptions: ['owner', 'manager'],
  offers: ['owner', 'manager'],
  products: ['owner', 'manager'],
  orders: ['owner', 'manager', 'dispatcher'],
} as const satisfies Record<string, readonly StaffRole[]>;

export function canAccessCrm(role: StaffRole, resource: keyof typeof CRM_ROLE_MATRIX) {
  return (CRM_ROLE_MATRIX[resource] as readonly StaffRole[]).includes(role);
}
