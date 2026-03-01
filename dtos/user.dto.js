import { ApiError } from "../utils/ApiError.js";

const USER_ROLES = new Set(["admin", "manager", "support", "user"]);
const SORT_FIELDS = new Set(["createdAt", "updatedAt", "name", "email"]);
const SORT_ORDERS = new Set(["asc", "desc"]);
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const ensureObject = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, `${label} must be an object`);
  }
  return value;
};

const parseBoolean = (value, fieldName) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new ApiError(400, `${fieldName} must be true or false`);
};

const validatePassword = (value) => {
  if (typeof value !== "string" || value.length < 8) {
    throw new ApiError(400, "password must be at least 8 characters long");
  }
  return value;
};

export const userIdParamSchema = {
  parse(input) {
    const params = ensureObject(input, "Params");

    if (!objectIdRegex.test(params.id || "")) {
      throw new ApiError(400, "Invalid user id");
    }

    return { id: params.id };
  },
};

export const listUsersQuerySchema = {
  parse(input) {
    const query = ensureObject(input, "Query");
    const output = {};

    if (query.page !== undefined) {
      const page = Number.parseInt(query.page, 10);
      if (Number.isNaN(page) || page < 1) throw new ApiError(400, "page must be >= 1");
      output.page = String(page);
    }

    if (query.limit !== undefined) {
      const limit = Number.parseInt(query.limit, 10);
      if (Number.isNaN(limit) || limit < 1) throw new ApiError(400, "limit must be >= 1");
      output.limit = String(limit);
    }

    if (query.role !== undefined) {
      if (!USER_ROLES.has(query.role)) {
        throw new ApiError(400, "role must be one of: admin, manager, support, user");
      }
      output.role = query.role;
    }

    if (query.isActive !== undefined) {
      output.isActive = parseBoolean(query.isActive, "isActive");
    }

    if (query.sort !== undefined) {
      if (!SORT_FIELDS.has(query.sort)) {
        throw new ApiError(400, "sort must be one of: createdAt, updatedAt, name, email");
      }
      output.sort = query.sort;
    }

    if (query.order !== undefined) {
      if (!SORT_ORDERS.has(query.order)) {
        throw new ApiError(400, "order must be asc or desc");
      }
      output.order = query.order;
    }

    if (query.search !== undefined) {
      if (typeof query.search !== "string") throw new ApiError(400, "search must be string");
      output.search = query.search.trim();
    }

    return output;
  },
};

const normalizeUserPayload = (input, { partial }) => {
  const body = ensureObject(input, "Body");
  const output = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length < 2) {
      throw new ApiError(400, "name must be a string with at least 2 characters");
    }
    output.name = body.name.trim();
  }

  if (!partial || body.email !== undefined) {
    if (typeof body.email !== "string" || !body.email.includes("@")) {
      throw new ApiError(400, "email must be a valid email address");
    }
    output.email = body.email.trim().toLowerCase();
  }

  if (!partial || body.password !== undefined) {
    output.password = validatePassword(body.password);
  }

  if (body.role !== undefined) {
    if (!USER_ROLES.has(body.role)) {
      throw new ApiError(400, "role must be one of: admin, manager, support, user");
    }
    output.role = body.role;
  }

  if (body.permissions !== undefined) {
    if (!Array.isArray(body.permissions) || body.permissions.some((value) => typeof value !== "string")) {
      throw new ApiError(400, "permissions must be an array of strings");
    }
    output.permissions = body.permissions;
  }

  if (body.isActive !== undefined) {
    output.isActive = parseBoolean(body.isActive, "isActive");
  }

  return output;
};

export const createUserSchema = {
  parse(input) {
    return normalizeUserPayload(input, { partial: false });
  },
};

export const updateUserSchema = {
  parse(input) {
    const parsed = normalizeUserPayload(input, { partial: true });

    if (Object.keys(parsed).length === 0) {
      throw new ApiError(400, "At least one field is required to update user");
    }

    return parsed;
  },
};
