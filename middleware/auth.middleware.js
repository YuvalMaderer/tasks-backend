const jwt = require("jsonwebtoken");
const Task = require("../models/task.model");

const { JWT_SECRET } = process.env;

function verifyToken(req, res, next) {
  // Split the token from the header (Bearer token)
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"]; // Get the authorization header
  const token_0 = authHeader && authHeader.split(" ")[1]; // Get the token from the header
  const pattern = /[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/;
  const match = token_0.match(pattern);
  const token = match[0];

  if (!token) {
    console.log("auth.middleware, verifyToken. No token provided");
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token
    req.userId = decoded.userId; // Add userId to request object
    next(); // Call next middleware
  } catch (error) {
    console.log(
      "auth.middleware, verifyToken. Error while verifying token",
      error
    );
    res.status(401).json({ error: "Invalid token" });
  }
}

// async function authorizeTaskOwner(req, res, next) {
//   const { id: taskId } = req.params;
//   const task = await Task.findById(taskId);
//   if (!task) {
//     return res.status(404).json({ message: "Task not found" });
//   }

//   if (task.user.toString() !== req.userId) {
//     return res.status(403).json({ message: "User not authorized" });
//   }

//   next();
// }

module.exports = { verifyToken };
