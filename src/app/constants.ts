export const USER_ROLES = {
  ADMINISTRATOR: 'Administrator',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const TIERS = {
  PRIMARY: 'primary',     // Class 1-5
  SECONDARY: 'secondary', // Class 6-12
} as const;

export type Tier = (typeof TIERS)[keyof typeof TIERS];
