import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { comparePassword, hashPassword } from "../utils/passwordHashing.js";
import { generateToken } from "../utils/generateToken.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const registerUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email }).lean();
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await hashPassword(payload.password);

  const user = await User.create({
    ...payload,
    password: hashedPassword,
  });

  const token = generateToken(user._id.toString());

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is inactive. Contact support");
  }

  const token = generateToken(user._id.toString());

  return {
    user: sanitizeUser(user),
    token,
  };
};
