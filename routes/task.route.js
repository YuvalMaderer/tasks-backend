const express = require("express");
const router = express.Router();
const {
  getUserTasks,
  getTaskById,
  deleteTask,
  createTask,
  updateTask,
} = require("../controllers/task.controller");

router.get("/", getUserTasks);
router.get("/:id", getTaskById);
router.delete("/:id", deleteTask);
router.post("/", createTask);
router.patch("/:id", updateTask);

module.exports = router;
