import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, getUserGroups } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getUserGroups);

export default router;
