import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", authenticateJWT, authController.profile);

router.get("/admin", authenticateJWT, authorizeRole(["admin"]), (req, res) => {
  res.json({ message: "Welcome, Admin!" });
});

export default router;
