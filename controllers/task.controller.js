const User = require("../models/user.model");
const Task = require("../models/task.model");

// get user tasks
async function getUserTasks(req, res) {
  const { userId } = req;

  try {
    const tasks = await Task.find({ user: userId });
    res.status(200).json(tasks);
  } catch (err) {
    console.log("tasks.controller, getTasks. Error while getting tasks", err);
    res.status(500).json({ message: "Server error while getting tasks" });
  }
}

// Get a single task
async function getTaskById(req, res) {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    res.status(200).json(task);
  } catch (err) {
    if (err.name === "CastError") {
      console.log(
        `task.controller, getTaskById. CastError! task not found with id: ${id}`
      );
      return res.status(404).json({ message: "task not found" });
    }
    console.log(
      `task.controller, getTaskById. Error while getting task with id: ${id}`,
      err
    );
    res.status(500).json({ message: "Server error while getting task" });
  }
}

// Delete a task
async function deleteTask(req, res) {
  const { id } = req.params;
  try {
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      console.log(`task.controller, deleteTask. Task not found with id: ${id}`);
      return res.status(404).json({ message: "Task not found" });
    }

    await User.findByIdAndUpdate(
      req.userId,
      { $pull: { tasks: deletedTask._id } },
      { new: true, useFindAndModify: false }
    );

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.log(
      `Task.controller, deleteTask. Error while deleting tasj with id: ${id}`,
      err
    );
    res.status(500).json({ message: "Server error while deleting task" });
  }
}

// Create a new task
async function createTask(req, res) {
  try {
    const newTask = new Task(req.body);
    newTask.user = req.userId; // Add the user id to the product
    const savedTask = await newTask.save();

    // Update the user's product array
    await User.findByIdAndUpdate(req.userId, {
      $push: { tasks: savedTask._id }, // Add the product id to the user's products array
    });

    res.status(201).json(savedTask);
  } catch (err) {
    if (err.name === "ValidationError") {
      // Mongoose validation error
      console.log(`task.controller, createTask. ${err.message}`);
      res.status(400).json({ message: err.message });
    } else {
      // Other types of errors
      console.log(`task.controller, createTask. ${err.message}`);
      res.status(500).json({ message: "Server error while creating task" });
    }
  }
}

async function updateTask(req, res) {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Ensure that validation rules are applied
    });

    if (!updatedTask) {
      console.log(`task.controller, updateTask. Task not found with id: ${id}`);
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    if (err.name === "ValidationError") {
      console.log(`task.controller, updateTask. ${err.message}`);
      res.status(400).json({ message: err.message });
    } else {
      console.log(
        `task.controller, updateTask. Error while updating task with id: ${id}`,
        err
      );
      res.status(500).json({ message: "Server error while updating task" });
    }
  }
}

module.exports = {
  getUserTasks,
  getTaskById,
  deleteTask,
  createTask,
  updateTask,
};
