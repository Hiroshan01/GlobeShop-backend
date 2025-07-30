import express from "express"
import { createUser, getUserById, getUsers, googleLogin, resetPassword, sendOtp, userLogin } from "../controllers/userController.js";



const userRoute = express.Router();


userRoute.post("/", createUser)
userRoute.post("/login", userLogin)
userRoute.get("/users_get", getUsers)
userRoute.get("/:_id", getUserById);
userRoute.post("/google-login", googleLogin)
userRoute.post("/send-otp", sendOtp)
userRoute.post("/reset-password", resetPassword)

export default userRoute;