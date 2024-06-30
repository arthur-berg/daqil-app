export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
  THERAPIST: "THERAPIST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
