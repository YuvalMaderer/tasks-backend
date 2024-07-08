const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const connectDB = require("./config/db");

const { verifyToken } = require("./middleware/auth.middleware");

dotenv.config(); // Load config

async function main() {
  // Connect to database
  await connectDB();

  // MIDDLEWARES
  // parse json body in request (for POST, PUT, PATCH requests)
  app.use(express.static("public"));
  app.use(express.json());

  // allow CORS for local development (for production, you should configure it properly)
  app.use(cors());

  // Routes
  const authRoutes = require("./routes/auth.route");
  const taskRoutes = require("./routes/task.route");
  const contactRoutes = require("./routes/contact.route");

  app.use("/api/contact", contactRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/task", verifyToken, taskRoutes);

  // Catch-all route
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main();
