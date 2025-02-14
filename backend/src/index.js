import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {connectDB} from "./lib/db.js";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {app,server} from "./lib/socket.js";


dotenv.config();
const PORT= process.env.PORT;
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '3mb', extended: true }));


app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);


server.listen(PORT,()=>{
    console.log("server listening on port:"+PORT);
    connectDB();
})