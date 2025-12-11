import express from "express";
import userController from "../controllers/userController.js";
const userRouter = express.Router();

userRouter.post("/auth/register", userController.registerUser);
userRouter.get("/auth/verify-email/:token", userController.verifyEmail);
userRouter.post("/auth/login", userController.loginUser);
userRouter.post("/auth/validateOTP", userController.validateOTP);
userRouter.post("/auth/resendOTP", userController.resendOTP);

userRouter.post(
  "/auth/update-password/send-otp",
  userController.forgetPasswordSentOTP
);

userRouter.post(
  "/auth/update-password/verify-otp",
  userController.forgetPasswordValidateOTP
);

userRouter.put(
  "/auth/update-password/new-password",
  userController.updatePassword
);

export default userRouter;
