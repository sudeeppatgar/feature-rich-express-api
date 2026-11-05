import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const generateToken = (id) => {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET must be configured before generating tokens");
  }

  const expiresIn = /** @type {import("jsonwebtoken").SignOptions["expiresIn"]} */ (
    config.jwtExpiresIn || "1w"
  );

  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn,
  });
};
