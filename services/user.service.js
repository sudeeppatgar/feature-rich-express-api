import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword } from "../utils/passwordHashing.js";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const ALLOWED_SORT_FIELDS = new Set(["createdAt", "updatedAt", "name", "email"]);
const USER_SELECT_FIELDS = "name email role permissions isActive createdAt updatedAt";

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const buildPagination = ({ page, limit }) => {
  const parsedPage = Math.max(1, toInt(page, 1));
  const parsedLimit = Math.min(MAX_LIMIT, Math.max(1, toInt(limit, DEFAULT_LIMIT)));

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

const buildFilters = ({ role, isActive, search }) => {
  const filters = {};

  if (role) filters.role = role;
  if (typeof isActive === "boolean") filters.isActive = isActive;

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  return filters;
};

const buildSort = ({ sort = "createdAt", order = "desc" }) => {
  const sortField = ALLOWED_SORT_FIELDS.has(sort) ? sort : "createdAt";
  return { [sortField]: order === "asc" ? 1 : -1 };
};

export const listUsers = async (query) => {
  const { page, limit, skip } = buildPagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query);

  const [items, total] = await Promise.all([
    User.find(filters).sort(sort).skip(skip).limit(limit).select(USER_SELECT_FIELDS).lean(),
    User.countDocuments(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    appliedFilters: {
      role: query.role || null,
      isActive: query.isActive ?? null,
      search: query.search || null,
      sort: query.sort || "createdAt",
      order: query.order || "desc",
    },
  };
};

export const createUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email }).lean();
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const password = await hashPassword(payload.password);

  const user = await User.create({
    ...payload,
    password,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select(USER_SELECT_FIELDS).lean();
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

export const updateUserById = async (id, payload) => {
  if (payload.email) {
    const duplicate = await User.findOne({ email: payload.email, _id: { $ne: id } }).lean();
    if (duplicate) {
      throw new ApiError(409, "Email already used by another user");
    }
  }

  const updateData = { ...payload };
  if (payload.password) {
    updateData.password = await hashPassword(payload.password);
    updateData.passwordChangedAt = new Date();
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .select(USER_SELECT_FIELDS)
    .lean();

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return updatedUser;
};

export const deleteUserById = async (id) => {
  const deletedUser = await User.findByIdAndDelete(id).select(USER_SELECT_FIELDS).lean();
  if (!deletedUser) {
    throw new ApiError(404, "User not found");
  }

  return deletedUser;
};
