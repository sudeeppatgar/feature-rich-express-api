import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { PERMISSIONS, requirePermissions } from "../middlewares/rbac.middleware.js";
import {
  createUserController,
  deleteUserByIdController,
  getUserByIdController,
  listUsersController,
  updateUserByIdController,
} from "../controllers/user.controller.js";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
  userIdParamSchema,
} from "../dtos/user.dto.js";

const router = Router();

router.use(protect);

router.get(
  "/",
  validate(listUsersQuerySchema, "query"),
  requirePermissions(PERMISSIONS.CAN_VIEW_USERS),
  asyncHandler(listUsersController),
);

router.post(
  "/",
  validate(createUserSchema),
  requirePermissions(PERMISSIONS.CAN_MANAGE_USERS),
  asyncHandler(createUserController),
);

router.get(
  "/:id",
  validate(userIdParamSchema, "params"),
  requirePermissions(PERMISSIONS.CAN_VIEW_USERS),
  asyncHandler(getUserByIdController),
);

router.patch(
  "/:id",
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema),
  requirePermissions(PERMISSIONS.CAN_MANAGE_USERS),
  asyncHandler(updateUserByIdController),
);

router.delete(
  "/:id",
  validate(userIdParamSchema, "params"),
  requirePermissions(PERMISSIONS.CAN_MANAGE_USERS),
  asyncHandler(deleteUserByIdController),
);

export default router;
