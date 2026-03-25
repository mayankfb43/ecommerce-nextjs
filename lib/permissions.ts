// All permission constants
export const PERMISSIONS = {
  PRODUCT_VIEW: "product:view",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",
  ORDER_CREATE: "order:create",
  ORDER_VIEW: "order:view",
  ORDER_UPDATE_STATUS: "order:update_status",
  CART_ADD: "cart:add",
  CART_VIEW: "cart:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Default permissions per role
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  guest: [PERMISSIONS.PRODUCT_VIEW],
  customer: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.CART_ADD,
    PERMISSIONS.CART_VIEW,
  ],
  admin: Object.values(PERMISSIONS),
};

/** Get the default permissions for a given role */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.guest;
}

/** Check whether a permissions array includes the required permission */
export function hasPermission(
  permissions: string[],
  required: Permission
): boolean {
  return permissions.includes(required);
}
