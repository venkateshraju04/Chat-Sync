import cloudinary from "../lib/cloudinary.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
    try {
        const { name, members, groupPic } = req.body;
        const adminId = req.user._id;

        if (!name) {
            return res.status(400).json({ message: "Group name is required" });
        }

        let parsedMembers = [];
        if (typeof members === "string") {
            parsedMembers = JSON.parse(members);
        } else if (Array.isArray(members)) {
            parsedMembers = members;
        }

        // Ensure admin is in the members list
        if (!parsedMembers.includes(adminId.toString())) {
            parsedMembers.push(adminId.toString());
        }

        if (parsedMembers.length < 2) {
            return res.status(400).json({ message: "A group must have at least 2 members" });
        }

        let groupPicUrl = "";
        if (groupPic) {
            const uploadResponse = await cloudinary.uploader.upload(groupPic);
            groupPicUrl = uploadResponse.secure_url;
        }

        const newGroup = new Group({
            name,
            groupPic: groupPicUrl,
            admin: adminId,
            members: parsedMembers,
        });

        await newGroup.save();

        // Populate members to return details
        const populatedGroup = await Group.findById(newGroup._id).populate("members", "fullName email profilePic");

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.log("Error in createGroup controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId }).populate("members", "fullName email profilePic");
        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getUserGroups controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
