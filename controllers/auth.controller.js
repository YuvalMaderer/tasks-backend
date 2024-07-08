const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = process.env;

const SALT_ROUNDS = 10; // Number of rounds to generate salt. 10 is recommended value

async function register(req, res) {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS); // Hash password
    const user = new User({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
    }); // Create new user object
    await user.save(); // Save user to database

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("register", error);
    if (error.code === 11000) {
      console.log("username already exists");
      return res.status(400).json({ error: "User already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Generate JWT token containing user id
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send token in response to the client, not the user object!
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
}

async function getUserById(req, res) {
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    const { password, ...userWithoutPassword } = user._doc;
    res.status(200).json(userWithoutPassword);
  } catch (err) {
    if (err.name === "CastError") {
      console.log(
        `user.controller, getUserById. CastError! user not found with id: ${userId}`
      );
      return res.status(404).json({ message: "User not found" });
    }
    console.log(
      `user.controller, getUserById. Error while getting user with id: ${userId}`,
      err
    );
    res.status(500).json({ message: "Server error while getting user" });
  }
}

module.exports = { register, login, getUserById };
