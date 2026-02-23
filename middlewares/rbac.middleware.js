import { ApiError } from "../utils/ApiError.js";

export const PERMISSIONS = {
  CAN_MANAGE_USERS: "canManageUsers",
  CAN_PROCESS_PAYMENTS: "canProcessPayments",
  CAN_VIEW_USERS: "canViewUsers",
};

const rolePermissionsMap = {
  admin: [
    PERMISSIONS.CAN_MANAGE_USERS,
    PERMISSIONS.CAN_PROCESS_PAYMENTS,
    PERMISSIONS.CAN_VIEW_USERS,
  ],
  manager: [PERMISSIONS.CAN_MANAGE_USERS, PERMISSIONS.CAN_VIEW_USERS],
  support: [PERMISSIONS.CAN_VIEW_USERS],
  user: [],
};

const getEffectivePermissions = (user) => {
  const rolePermissions = rolePermissionsMap[user?.role] || [];
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];

  return new Set([...rolePermissions, ...userPermissions]);
};

export const requirePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized. User context is missing."));
    }

    const effectivePermissions = getEffectivePermissions(req.user);
    const missingPermissions = requiredPermissions.filter(
      (permission) => !effectivePermissions.has(permission),
    );

    if (missingPermissions.length > 0) {
      return next(
        new ApiError(
          403,
          `Forbidden. Missing permissions: ${missingPermissions.join(", ")}`,
        ),
      );
    }

    return next();
  };
};

export const rolePermissions = rolePermissionsMap;
