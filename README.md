# Chat Sync - Real Time Chat App

## Overview
Chat Sync is a real-time chat application built using MERN (MongoDB, Express.js, React and Node.js). It allows a user to chat with other registered users in real-time.

## [Web App Link](https://chat-sync-kipy.onrender.com)

## YouTube Demo
[![Watch the video](https://res.cloudinary.com/dy0xvvpe6/image/upload/v1739625616/Screenshot_2025-02-15_153814_cbyucd.png)](https://www.youtube.com/watch?v=v7dVHzjHLUY)

## Features
- Responsive UI
- 30+ unique themes to choose from
- Real-Time messaging
- Send and receive images
- Online/Offline status indication
- Custom user profile picture
- User authentication and authorization

## Tech Stack
- **Frontend:** React, TailwindCSS and Daisy UI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- Socket.io for real-time communication
- JWT (Json Web Token) and Bcrypt for user authentication
- Cloudinary to storing and delivering user images

## Getting Started
>[!NOTE]
>Ensure Node.js is installed before proceeding. You can check by running `node -v` in your terminal.
1. Clone this repository
   ```bash
   git clone https://github.com/venkateshraju04/Chat-Sync.git
   ```
2. Configure .env file
   
   Create a .env file in **backend** directory and add the below environment variables
   ```env
   MONGODB_URI=
   PORT=5001
   JWT_SECRET=
   NODE_ENV=development
   
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```
4. Build and start the app
   
   ❗ cd to Chat-Sync (root) directory before building the app.
   ```bash
   npm run build
   ```
   ```bash
   npm start
   ```
   
