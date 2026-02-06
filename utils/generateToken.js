import jwt from "jsonwebtoken";
import { config } from "../config";
export const generateToken = (id) => {
  jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || "1w",
  });
};
