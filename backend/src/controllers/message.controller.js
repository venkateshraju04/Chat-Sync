import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js"
import {io, getReceiverSocketId} from "../lib/socket.js"
export const getUsersForSidebar=async(req,res)=>{
    try {
        const loggedInUserId=req.user._id;
        const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password");
        
        // Aggregate unread message counts for each sender
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    receiverId: loggedInUserId,
                    isRead: false,
                }
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 }
                }
            }
        ]);

        const unreadMap = {};
        unreadCounts.forEach((item) => {
            if (item._id) {
                unreadMap[item._id.toString()] = item.count;
            }
        });

        // Aggregate last message timestamps for each conversation partner (1-to-1 only)
        const lastMessages = await Message.aggregate([
            {
                $match: {
                    receiverId: { $exists: true },
                    $or: [
                        { senderId: loggedInUserId },
                        { receiverId: loggedInUserId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", loggedInUserId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessageAt: { $first: "$createdAt" }
                }
            }
        ]);

        const lastMessageMap = {};
        lastMessages.forEach((item) => {
            if (item._id) {
                lastMessageMap[item._id.toString()] = item.lastMessageAt;
            }
        });

        const usersWithUnreadAndSort = filteredUsers.map((user) => {
            return {
                ...user.toObject(),
                unreadCount: unreadMap[user._id.toString()] || 0,
                lastMessageAt: lastMessageMap[user._id.toString()] || new Date(0),
            };
        });

        // Sort contacts: newest lastMessageAt first
        usersWithUnreadAndSort.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

        res.status(200).json(usersWithUnreadAndSort);
    } catch (error) {
        console.log("Error in getting filtered users", error.message);
        res.status(500).json({error:"Internal server error"});
    }
}

export const getMessages=async(req,res)=>{
    try {
        const {id:userToChatId}=req.params;
        const myId=req.user._id;

        const messages= await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getting messages", error.message);
        res.status(500).json({error:"Internal server error"})
    }
}

export const SendMessage=async(req,res)=>{
    try {
        const {text,image}=req.body;
        const {id: targetId}=req.params;
        const {isGroup}=req.query;
        const senderId=req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }
        
        let newMessage;
        if (isGroup === "true") {
            newMessage = new Message({
                senderId,
                groupId: targetId,
                text,
                image: imageUrl,
            });
        } else {
            newMessage = new Message({
                senderId,
                receiverId: targetId,
                text,
                image: imageUrl,
            });
        }
        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id).populate("senderId", "fullName profilePic");

        if (isGroup === "true") {
            const Group = mongoose.model("Group");
            const group = await Group.findById(targetId);
            if (group) {
                group.members.forEach((memberId) => {
                    if (memberId.toString() !== senderId.toString()) {
                        const memberSocketId = getReceiverSocketId(memberId);
                        if (memberSocketId) {
                            io.to(memberSocketId).emit("newGroupMessage", populatedMessage);
                        }
                    }
                });
            }
        } else {
            const receiverSocketId=getReceiverSocketId(targetId);
            if(receiverSocketId){
                io.to(receiverSocketId).emit("newMessage", populatedMessage);
            }
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.log("error in sending message",error.message);
        res.status(500).json({error:"Internal server error"})
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const { id: senderId } = req.params;
        const receiverId = req.user._id;

        await Message.updateMany(
            { senderId, receiverId, isRead: false },
            { isRead: true }
        );

        // Notify the sender that messages have been read
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", { readerId: receiverId });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.log("Error in markMessagesAsRead controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const messages = await Message.find({ groupId }).populate("senderId", "fullName profilePic");
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getGroupMessages:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};