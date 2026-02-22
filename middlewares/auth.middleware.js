import jwt from "jsonwebtoken";
import { config } from "../config";
import { asyncHandler } from "./async.middleware";
import { ApiError } from "../utils/apiError";

export const createAuthMiddleware = ({ model, jwtSecret }) => {
  const protect = asyncHandler(async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Unauthorized access. No token Provided");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await model.findById(decoded.id);
      if (!user) throw new ApiError(401, "Invalid token. User not found");
      if (!user.isActive)
        throw new ApiError(403, "Your account is inactive. Contact support");
      if (user.passwordChangedAt) {
        const passwordChangedAt = parseInt(
          user.passwordChangedAt.getTime() / 1000,
          10,
        );

        if (passwordChangedAt > decoded.iat) {
          throw new ApiError(
            401,
            "Password changed recently. Please log in again.",
          );
        }
      }
      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid or expired Token");
    }
  });

  const restrictTo =
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, "Access denied. Insufficient permissions.");
      }
      next();
    };
  return { protect, restrictTo };
};

export const { protect, restrictTo } = createAuthMiddleware({
  model: usermodel,
  jwtSecret: config.jwtSecret,
});
