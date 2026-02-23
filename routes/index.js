import { Router } from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import docsRoutes from "./docs.route.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/docs", docsRoutes);

router.get("/", (req, res) => {
  res.send("Welcome to the Feature-Rich Express API!");
});

export default router;
