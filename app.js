import express from "express";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(cors());
// app.use("/", routes);
app.get("/", (req, res) => {
  res.send("hello world");
});
export default app;
