import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: accessToken,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: accessToken,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    // With access tokens only, logout is mainly clearing state on frontend,
    // but we can send a success response.
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};
