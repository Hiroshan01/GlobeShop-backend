import express from "express"
import { createUser, getUserById, getUsers, googleLogin, resetPassword, sendOtp, updateUserProfile, userLogin } from "../controllers/userController.js";

const userRoute = express.Router();

// Static routes first
userRoute.post("/", createUser)
userRoute.post("/login", userLogin)
userRoute.get("/users_get", getUsers)
userRoute.post("/google-login", googleLogin)
userRoute.post("/send-otp", sendOtp)
userRoute.post("/reset-password", resetPassword)

// Dynamic routes last
userRoute.get("/:userId", getUserById);
userRoute.put("/:userId", updateUserProfile)

export default userRoute;