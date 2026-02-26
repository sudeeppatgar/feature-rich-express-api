import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { loginSchema, registerSchema } from "../dtos/auth.dto.js";
import { loginController, registerController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(registerController));
router.post("/login", validate(loginSchema), asyncHandler(loginController));

export default router;
