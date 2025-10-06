import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as userService from "../services/userService.js";
dotenv.config();

export const validateUser = async (username, password) => {
  const user = await userService.findByUsername(username); 
  if (user && user.password === password) {
    return user;
  }
  return null;
};

export const issueToken = (user) => {
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || "supersecret", {
    expiresIn: "1h",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "supersecret");
};
