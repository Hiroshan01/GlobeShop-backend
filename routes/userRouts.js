import express from "express"
import { createUser, getUsers, userLogin } from "../controllers/userController.js";


const userRoute = express.Router();


userRoute.post("/", createUser)
userRoute.post("/login", userLogin)
userRoute.get("/users_get", getUsers)

export default userRoute;