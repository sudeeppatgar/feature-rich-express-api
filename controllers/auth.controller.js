import { ApiResponce } from "../utils/ApiResponce.js";
import { loginUser, registerUser } from "../services/auth.service.js";

export const registerController = async (req, res) => {
  const data = await registerUser(req.body);
  res.status(201).json(new ApiResponce(201, data, "User registered successfully"));
};

export const loginController = async (req, res) => {
  const data = await loginUser(req.body);
  res.status(200).json(new ApiResponce(200, data, "Login successful"));
};
