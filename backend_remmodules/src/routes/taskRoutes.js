import express from "express";
import * as taskController from "../controllers/taskController.js";
import { authorizeRole } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/", taskController.createTask);

router.get("/", taskController.listTasks); // /tasks?resourceId=res1&status=running

router.get("/:id", taskController.getTaskById);

router.delete("/:id", taskController.terminateTask);

router.get("/admin/all", authorizeRole(["admin"]), taskController.listAllTasks);

export default router;
