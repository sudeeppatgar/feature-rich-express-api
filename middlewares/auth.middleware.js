import jwt from "jsonwebtoken";
import { config } from "../config";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "./async.middleware";

export const createMiddleware = ({ userModel, jwtSecret }) => {
  const protect = asyncHandler(async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    if (!token) {
      throw new ApiError(401, "Unauthorized access. No token provided. ");
    }
    try {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await userModal.findById(decoded.id);
      if (!user) throw new ApiError(401, "invalid token, user not found");
      if (!user.isActive)
        throw new ApiError(401, "your account is inactive, contact support");
      if (user.passwordChangedAt) {
        const passwordChangedAt = parseInt(
          user.passwordChangedAt.getTime() / 1000,
          10,
        );
        if (passwordChangedAt > decoded.iat) {
          throw new ApiError(
            401,
            "password changed recently, please login again",
          );
        }
      }
      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, error.message || "Invalid or expired token.");
    }
  });
  const restrictTo =
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new ApiError(
          403,
          "Forbidden. You don't have permission to access this resource.",
        );
      }
      next();
    };
  return { protect, restrictTo };
};

export const { protect, restrictTo } = createMiddleware({
  userModel: userModel,
  jwtSecret: config.jwtSecret,
});

export const adminOnly = [protect, restrictTo("admin")];
export const employeeOnly = [protect, restrictTo("employee")];
export const customerOnly = [protect, restrictTo("customer")];
