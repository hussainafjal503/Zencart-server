import express from "express";
import userController from "../controllers/userController.js";



const userRouter = express.Router();


userRouter.post("/auth/register", userController.registerUser);
userRouter.get("/auth/verify-email/:token",userController.verifyEmail);

export default userRouter;
