import type { UserRole } from "@qlvmb/shared-types";

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Khách vãng lai",
  customer: "Khách hàng",
  member: "Hội viên",
  customer_support: "Nhân viên chăm sóc khách hàng",
  operations_staff: "Nhân viên vận hành"
};

export const BACKOFFICE_ROLE_BY_MODULE = {
  sales: "customer_support",
  support: "customer_support",
  operations: "operations_staff",
  finance: "customer_support",
  cms: "customer_support",
  admin: "operations_staff"
} as const;

export const BACKOFFICE_PERMISSION_BY_MODULE = {
  sales: "backoffice.sales",
  support: "backoffice.support",
  operations: "backoffice.operations",
  finance: "backoffice.finance",
  cms: "backoffice.cms",
  admin: "backoffice.admin"
} as const;

export type BackofficeModuleKey = keyof typeof BACKOFFICE_ROLE_BY_MODULE;

export function canAccessBackofficeModule(
  permissionsOrRoles: string[],
  moduleKey: BackofficeModuleKey
): boolean {
  if (!Array.isArray(permissionsOrRoles) || permissionsOrRoles.length === 0) {
    return false;
  }

  const requiredRole = BACKOFFICE_ROLE_BY_MODULE[moduleKey];
  const requiredPermission = BACKOFFICE_PERMISSION_BY_MODULE[moduleKey];
  return (
    permissionsOrRoles.includes(requiredRole) ||
    permissionsOrRoles.includes(requiredPermission)
  );
}

export function canAccessBackofficeModuleByRoles(
  roles: string[],
  moduleKey: BackofficeModuleKey
): boolean {
  return canAccessBackofficeModule(roles, moduleKey);
}

export function getAllowedBackofficeModulesByRoles(
  roles: string[]
): BackofficeModuleKey[] {
  return (Object.keys(BACKOFFICE_ROLE_BY_MODULE) as BackofficeModuleKey[]).filter(
    (moduleKey) => canAccessBackofficeModule(roles, moduleKey)
  );
}

export function hasAnyBackofficeAccess(roles: string[]): boolean {
  return getAllowedBackofficeModulesByRoles(roles).length > 0;
}

export function sanitizeUserRoles(roles: unknown): string[] {
  if (!Array.isArray(roles)) {
    return [];
  }

  return roles.filter((role): role is string => typeof role === "string");
}

export function isBackofficeModuleKey(value: string): value is BackofficeModuleKey {
  return value in BACKOFFICE_ROLE_BY_MODULE;
}

export function canAccessBackofficeModuleByPermissions(
  permissions: string[],
  moduleKey: BackofficeModuleKey
): boolean {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.includes(BACKOFFICE_PERMISSION_BY_MODULE[moduleKey]);
}

export function getAllowedBackofficeModulesByPermissions(
  permissions: string[]
): BackofficeModuleKey[] {
  return (Object.keys(BACKOFFICE_PERMISSION_BY_MODULE) as BackofficeModuleKey[]).filter(
    (moduleKey) => canAccessBackofficeModuleByPermissions(permissions, moduleKey)
  );
}
