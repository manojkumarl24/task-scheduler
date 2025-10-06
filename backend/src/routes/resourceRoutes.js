import express from "express";
import * as resourceController from "../controllers/resourceController.js";
import { authorizeRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authorizeRole(["admin"]), resourceController.createResource);
router.get("/",  resourceController.listResources);
router.get("/:id",  resourceController.getResource);
router.put("/:id", authorizeRole(["admin"]), resourceController.updateResource);
router.delete("/:id", authorizeRole(["admin"]), resourceController.deleteResource);

export default router;
