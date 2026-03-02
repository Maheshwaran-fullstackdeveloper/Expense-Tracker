import jwt from "jsonwebtoken";
import User from "../models/User.js";
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }
      return next();
    } catch (error) {
      console.error(error);
      res.status(401);
      const message =
        error.name === "TokenExpiredError"
          ? "Token expired"
          : "Not authorized, token failed";
      return next(new Error(message));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, no token"));
  }
};

export { protect };
