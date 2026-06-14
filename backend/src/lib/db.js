import mongoose from "mongoose";
import Message from "../models/message.model.js";

export const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGODB_URI);
        console.log(`DB connected:${conn.connection.host}`);
        
        // Migrate legacy messages that do not have isRead field
        const result = await Message.updateMany({ isRead: { $exists: false } }, { isRead: true });
        if (result.modifiedCount > 0) {
            console.log(`Migrated ${result.modifiedCount} legacy messages to isRead: true`);
        }
    }
    catch(error){
        console.log("DB connection error:",error);
    }
};
