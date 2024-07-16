export const UserRole = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
  THERAPIST: "THERAPIST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
