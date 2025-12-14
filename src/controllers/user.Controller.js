import userService from "../services/userService.js";
import responseProvider from "../utils/responseFunction.js";
import APIError from "../utils/ErrorClass.js";
import { logger } from "../utils/logger.js";
import userModel from "../Models/user.model.js";
class UserController {
  // user Registeration
  async registerUser(req, res, next) {
    try {
      const response = await userService.userRegister(req.body);

      if (response?.success === false) {
        return responseProvider(
          res,
          response?.success,
          response?.status,
          response?.message
        );
      }
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
          response.status,
          response.message
        );
      }

      return res
        .cookie("accessToken", response.accessToken, {
          httpOnly: process.env.APPLICATION_ENVIRONMENT === "production",
          secure: process.env.APPLICATION_ENVIRONMENT === "production",
          sameSite: "lax",
          maxAge: 1 * 60 * 60 * 1000,
        })
        .cookie("refreshToken", response.refreshToken, {
          httpOnly: process.env.APPLICATION_ENVIRONMENT === "production",
          secure: process.env.APPLICATION_ENVIRONMENT === "production",
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

  async loginUser(req, res, next) {
    try {
      logger.log(req.body);
      const loginResponse = await userService.userLogin(req.body);

      console.log(loginResponse);
      if (loginResponse.success === false) {
        return responseProvider(
          res,
          loginResponse.success,
          loginResponse.status,
          loginResponse.message
        );
      }

      return responseProvider(
        res,
        loginResponse.success,
        loginResponse.status,
        loginResponse.message
      );
    } catch (err) {
      logger.error("Error occured in login user controller :: ", err);
      return next(new APIError("Internal Server Error, Unable to LogIn", 500));
    }
  }

  async validateOTP(req, res, next) {
    try {
      const OTPResponse = await userService.validateOTP(req.body);

      if (OTPResponse.success === false) {
        return responseProvider(
          res,
          OTPResponse.success,
          OTPResponse.status,
          OTPResponse.message
        );
      }

      return res
        .cookie("accessToken", OTPResponse.accessToken, {
          httpOnly: process.env.APPLICATION_ENVIRONMENT === "production",
          secure: process.env.APPLICATION_ENVIRONMENT === "production",
          sameSite: "lax",
          maxAge: 1 * 60 * 60 * 1000,
        })
        .cookie("refreshToken", OTPResponse.refreshToken, {
          httpOnly: process.env.APPLICATION_ENVIRONMENT === "production",
          secure: process.env.APPLICATION_ENVIRONMENT === "production",
          sameSite: "strict",
          maxAge: 1 * 24 * 60 * 60 * 1000,
        })
        .status(200)
        .json({
          message: "OTP Verified SuccessFully..",
          data: OTPResponse.getUser,
        });
    } catch (err) {
      logger.error("Error occured in ValidateOTP controller :: ", err);
      return next(
        new APIError("Internal Server Error, Unable validate OTP", 500)
      );
    }
  }

  async resendOTP(req, res, next) {
    try {
      const resentOTPResponse = await userService.resendOTP(req.body);

      if (resentOTPResponse.success === false) {
        return responseProvider(
          res,
          resentOTPResponse.success,
          resentOTPResponse.status,
          resentOTPResponse.message
        );
      }

      return responseProvider(res, true, 200, "OTP Sent", resentOTPResponse);
    } catch (Err) {
      logger.log("ERROR OCCURED IN RESENT OTP CONTROLLER :: ", Err);
      return next(
        new APIError("Internal Server Error Unable to send OTP", 500)
      );
    }
  }

  async forgetPasswordSentOTP(req, res, next) {
    try {
      const sentOtpResponse = await userService.forgetPasswordSentOTP(req.body);
      if (sentOtpResponse === false) {
        return responseProvider(
          res,
          sentOtpResponse.success,
          sentOtpResponse.status,
          sentOtpResponse.message
        );
      }

      return responseProvider(
        res,
        true,
        200,
        "OTP Sent, Please Verify Your Account.",
        sentOtpResponse
      );
    } catch (err) {
      logger.error(
        "ERROR OCCURRED IN FORGET PASSWORD SENT OTP  CONTROLLER ::",
        err
      );
      return next(
        new APIError("Internal Server Error, Please try after some time", 500)
      );
    }
  }

  async forgetPasswordValidateOTP(req, res, next) {
    try {
      const OTPResponse = await userService.forgetPasswordValidateOTP(req.body);

      if (OTPResponse.success === false) {
        return responseProvider(
          res,
          OTPResponse.success,
          OTPResponse.status,
          OTPResponse.message
        );
      }
      return responseProvider(
        res,
        true,
        200,
        "OTP Verified successfully, create Your new password."
      );
    } catch (err) {
      logger.error(
        "Error occured in forget password ValidateOTP controller :: ",
        err
      );
      return next(
        new APIError("Internal Server Error, Unable validate OTP", 500)
      );
    }
  }

  async updatePassword(req, res, next) {
    try {
      const updatePasswordResponse = await userService.updatePassword(req.body);

      if (updatePasswordResponse.success == false) {
        return responseProvider(
          res,
          updatePasswordResponse.success,
          updatePasswordResponse.status,
          updatePasswordResponse.message
        );
      }

      return responseProvider(
        res,
        true,
        200,
        "Password updated Please login in.",
        updatePasswordResponse.getUser
      );
    } catch (err) {
      logger.error("ERROR OCCURED IN UPDATE PASSWORD CONTROLLER :: ", err);
      return next(new APIError("Internal server Error Please try again.", 500));
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.userId;

      const deletedRefresh = await userModel.findOne({ _id: userId });
      deletedRefresh.refreshToken = "";
      await deletedRefresh.save();

      logger.log("deletedRefresh", deletedRefresh);

      res
        .clearCookie("accessToken", {
          httpOnly: process.env.APPLICATION_ENVIRONMENT === "production",
          secure: process.env.APPLICATION_ENVIRONMENT === "production",
          sameSite: "lax",
        })
        .clearCookie("refreshToken", {
          httpOnly: process.env.APPLICATION_ENVIRONMENT === "production",
          secure: process.env.APPLICATION_ENVIRONMENT === "production",
          sameSite: "strict",
        })
        .status(200)
        .json({
          success: true,
          message: "Logged out successfully..",
        });
    } catch (err) {
      logger.error("ERROR OCCURED IN LOGOUT CONTROLLER :: ", err);

      return next(new APIError("Internal Server Error Please try again", 500));
    }
  }
}

export default new UserController();
