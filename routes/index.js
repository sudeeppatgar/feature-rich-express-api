import Router from "express";

const router = Router();

router.use("/", (req, res) => {
  res.send("Welcome to the Feature-Rich Express API!");
});

export default router;
