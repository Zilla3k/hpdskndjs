export const RoleEnum = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  USER: "USER",
} as const;

export type Role = (typeof RoleEnum)[keyof typeof RoleEnum];

export const DEFAULT_ROLE: Role = RoleEnum.USER;

export function isRole(value: string): value is Role {
  return Object.values(RoleEnum).includes(value as Role);
}
