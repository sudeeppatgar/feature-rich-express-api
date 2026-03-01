import { Router } from "express";
import { openApiSpec } from "../docs/openapi.js";

const router = Router();

router.get("/openapi.json", (req, res) => {
  res.status(200).json(openApiSpec);
});

router.get("/swagger", (req, res) => {
  res.status(200).json({
    message: "Swagger UI is not installed. Use /api/docs/openapi.json in Swagger Editor.",
    specUrl: "/api/docs/openapi.json",
  });
});

export default router;
