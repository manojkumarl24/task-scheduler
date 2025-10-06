import jwt from "jsonwebtoken";
import * as userService from "../services/userService.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authenticateJWT = async (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return res.status(401).json({ error: "Missing token" });
  const token = h.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { sub: payload.sub || payload.id || payload.sub, username: payload.username, role: payload.role || payload.roles || "user" };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


export const authorizeRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
};
