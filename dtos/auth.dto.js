import { ApiError } from "../utils/ApiError.js";

const ensureObject = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, `${label} must be an object`);
  }
  return value;
};

const validateEmail = (email) => {
  if (typeof email !== "string" || !email.includes("@")) {
    throw new ApiError(400, "email must be a valid email address");
  }
  return email.trim().toLowerCase();
};

const validatePassword = (password) => {
  if (typeof password !== "string" || password.length < 8) {
    throw new ApiError(400, "password must be at least 8 characters long");
  }
  return password;
};

export const registerSchema = {
  parse(input) {
    const body = ensureObject(input, "Body");

    if (typeof body.name !== "string" || body.name.trim().length < 2) {
      throw new ApiError(400, "name must be a string with at least 2 characters");
    }

    return {
      name: body.name.trim(),
      email: validateEmail(body.email),
      password: validatePassword(body.password),
    };
  },
};

export const loginSchema = {
  parse(input) {
    const body = ensureObject(input, "Body");

    return {
      email: validateEmail(body.email),
      password: validatePassword(body.password),
    };
  },
};
