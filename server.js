import app from "./app.js";
import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";

// Connect to the database
connectDB();

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
