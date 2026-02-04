import express from "express";
import cors from "cors";
import helmet from "helmet";
// import routes from "./routes/index.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
// app.use("/", routes);
app.get("/", (req, res) => {
  res.send("hello world");
});
export default app;
