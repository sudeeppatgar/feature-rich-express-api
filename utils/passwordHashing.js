import bcrypt from "bcryptjs";

const saltRounds = 10;
export const hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required");
  }
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(password, hashedPassword);
};
