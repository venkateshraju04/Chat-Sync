import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, SendMessage, markMessagesAsRead, getGroupMessages } from "../controllers/message.controller.js";

const router=express.Router();

router.get("/users",protectRoute,getUsersForSidebar);
router.get("/:id",protectRoute,getMessages);
router.get("/group/:id",protectRoute,getGroupMessages);
router.post("/send/:id",protectRoute,SendMessage);
router.put("/read/:id",protectRoute,markMessagesAsRead);

export default router;