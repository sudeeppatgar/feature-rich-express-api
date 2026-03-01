import { ApiResponce } from "../utils/ApiResponce.js";
import {
  createUser,
  deleteUserById,
  getUserById,
  listUsers,
  updateUserById,
} from "../services/user.service.js";

export const listUsersController = async (req, res) => {
  const data = await listUsers(req.query);
  res.status(200).json(new ApiResponce(200, data, "Users fetched successfully"));
};

export const createUserController = async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json(new ApiResponce(201, user, "User created successfully"));
};

export const getUserByIdController = async (req, res) => {
  const user = await getUserById(req.params.id);
  res.status(200).json(new ApiResponce(200, user, "User fetched successfully"));
};

export const updateUserByIdController = async (req, res) => {
  const user = await updateUserById(req.params.id, req.body);
  res.status(200).json(new ApiResponce(200, user, "User updated successfully"));
};

export const deleteUserByIdController = async (req, res) => {
  const user = await deleteUserById(req.params.id);
  res.status(200).json(new ApiResponce(200, user, "User deleted successfully"));
};
