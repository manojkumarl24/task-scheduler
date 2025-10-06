import express from "express";
import * as userController from "../controllers/userController.js";
import { authorizeRole } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/", authorizeRole(["admin"]), userController.createUser);
router.get("/", authorizeRole(["admin"]), userController.listUsers);
router.get("/:id", authorizeRole(["admin"]), userController.getUser);
router.patch("/:id", authorizeRole(["admin"]), userController.updateUser);
router.delete("/:id", authorizeRole(["admin"]), userController.deleteUser);

export default router;
