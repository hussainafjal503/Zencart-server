import { emailVerificationLink } from "../config/mailTemplate.js";
import userService from "../services/userService.js";
import responseProvider from "../utils/responseFunction.js";
import jwt from "jsonwebtoken";
import APIError from "../utils/ErrorClass.js";
import sendMail from "../utils/sendMail.js";
import { logger } from "../utils/logger.js";
class UserController {
  // user Registeration
  async registerUser(req, res, next) {
    try {
      const response = await userService.userRegister(req.body);

      if (response?.success === false) {
        return responseProvider(
          res,
          response?.success,
          response?.statusCode,
          response?.message
        );
      }
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);

      const token = jwt.sign({ userId: response._id }, secret, {
        expiresIn: 1 * 60 * 60 * 1000,
      });

      await sendMail(
        "Email Verification Request",
        response.email,
        emailVerificationLink(
          `${process.env.FRONT_END_BASE_URL}/auth/verify-email/${token}`
        )
      );
      return responseProvider(
        res,
        true,
        200,
        "Register SuccessFull. Please Verify Your Email.."
      );
    } catch (err) {
      logger.error("error occured in register-user controller :: ", err);
      return next(new APIError("Internal server error while registering", 500));
    }
  }
  async verifyEmail(req, res, next) {
    try {
      const response = await userService.verifyEmail(req.params);

      if (response.success === false) {
        responseProvider(
          res,
          response.success,
          response.statusCode,
          response.message
        );
      }

      return res
        .cookie("accessToken", response.accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 1 * 60 * 60 * 1000,
        })
        .cookie("refreshToken", response.refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({
          message: "Email Verified SuccessFully..",
          data: response.userDetail,
        });
    } catch (err) {
      logger.error("Error occured in verify email controler ::", err);
      return next(
        new APIError("Unable Verify Your Mail, Please Try Again..", 500)
      );
    }
  }
}

export default new UserController();
