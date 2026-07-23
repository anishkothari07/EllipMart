export const Roles = {
  ADMIN: 'ADMIN',
  MERCHANT: 'MERCHANT',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = keyof typeof Roles;
