import { success, z } from "zod";
import { zSchema } from "../config/zodSchema.js";
import userModel from "../Models/user.model.js";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import sendMail from "../utils/sendMail.js";
import { emailVerificationLink } from "../config/mailTemplate.js";

import OTPModel from "../Models/otp.model.js";
import { generateOTP } from "../utils/otpGenerate.js";
import { otpEmailTemplate } from "../config/otpTemplate.js";
import generateToken from "../utils/generateTokens.js";

class UserService {
  async userRegister(data) {
    try {
      // validation schema
      const validationSchema = zSchema.pick({
        name: true,
        email: true,
        password: true,
      });
      const validatedData = validationSchema.safeParse(data);

      if (!validatedData.success) {
        return {
          success: false,
          status: 400,
          message: "Invalid or Missing Input Fields.. ",
        };
      }

      const { name, email, password } = validatedData.data;
      //validation for user already exists..
      const checkUser = await userModel.exists({ email });
      if (checkUser) {
        return {
          success: false,
          status: 409,
          message: "Email Already Exists..",
        };
      }

      //creating a new user
      const newUser = new userModel({
        name,
        email,
        password,
      });

      await newUser.save();

      const secret = new TextEncoder().encode(process.env.SECRET_KEY);

      const token = jwt.sign({ userId: newUser._id }, secret, {
        expiresIn: 1 * 60 * 60 * 1000,
      });

      await sendMail(
        "Email Verification Request",
        newUser.email,
        emailVerificationLink(
          `${process.env.FRONT_END_BASE_URL}/auth/verify-email/${token}`
        )
      );
      return newUser;
    } catch (err) {
      logger.error("Error occured in register user service :: ", err);
      throw err;
    }
  }

  async verifyEmail(data) {
    try {
      let { token } = data;
      if (!token) {
        return {
          success: false,
          status: 400,
          message: "Invalid Mail Verification, Please Try Again..",
        };
      }
      const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      const decode = jwt.verify(token, secret);

      const { userId } = decode;

      const userDetail = await userModel.findById(userId);

      if (!userDetail) {
        return {
          success: false,
          status: 404,
          message: "User not found.",
        };
      }

      userDetail.isEmailVerified = true;

      // const payload = {
      //   userId: userDetail._id,
      //   role: userDetail.role,
      // };
      // const accessToken = jwt.sign(payload, secret, {
      //   expiresIn: 1 * 60 * 60 * 1000,
      // });
      // const refreshToken = crypto.randomBytes(20).toString("hex");
      const { refreshToken, accessToken } = generateToken({
        userId: userDetail._id,
        role: userDetail.role,
      });

      userDetail.refreshToken = refreshToken;
      await userDetail.save();

      return {
        accessToken,
        refreshToken,
        userDetail,
      };
    } catch (err) {
      logger.error("Error occured in verify-email service :: ", err);
      throw err;
    }
  }

  async userLogin(data) {
    try {
      // logger.log(data);

      const validationSchema = zSchema
        .pick({
          email: true,
        })
        .extend({
          password: z.string(),
        });

      const validatedData = validationSchema.safeParse(data);

      if (!validatedData.success) {
        return {
          success: false,
          status: 400,
          message: "Missing Input Fields..",
        };
      }

      const { email, password } = validatedData.data;
      const userData = await userModel
        .findOne({ deletedAt: null, email })
        .select("+password");
      // logger.log(userData);
      if (!userData) {
        return {
          success: false,
          status: 400,
          message: "Invalid Login Credentials",
        };
      }

      //resend email verification if not verified..

      if (!userData.isEmailVerified) {
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

        return {
          success: false,
          status: 400,
          message: "please Verifiy Your Email ..",
        };
      }

      //password verification

      const isPasswordVerified = await userData.comparePassword(password);

      if (!isPasswordVerified) {
        return {
          success: false,
          status: 400,
          message: "Invalid Login Credentials",
        };
      }

      // otp Generation logics..

      await OTPModel.deleteMany({ email });

      let otp = generateOTP();
      const newOTPData = new OTPModel({
        email,
        otp,
      });
      await newOTPData.save();

      const otpEmailStatus = await sendMail(
        "Your login Verification Code",
        email,
        otpEmailTemplate(otp)
      );

      if (!otpEmailStatus.success) {
        return {
          success: false,
          status: 400,
          message: "Failed to Send OTP",
        };
      }

      logger.log("hello");

      return {
        success: true,
        status: 200,
        message: "Please Verify your Device..",
      };
    } catch (err) {
      logger.error("Error occured in Login user Service :: ", err);
      throw err;
    }
  }

  async validateOTP(data) {
    try {
      // logger.log(data)
      const validatedSchema = zSchema.pick({
        otp: true,
        email: true,
      });

      const validateData = validatedSchema.safeParse(data);

      if (!validateData.success) {
        return {
          success: false,
          status: 400,
          message: "Invalid or Missing Field..",
        };
      }

      const { email, otp } = validateData.data;
      const getOtpData = await OTPModel.findOne({ email, otp });
      // logger.log(getOtpData);
      if (!getOtpData) {
        return {
          success: false,
          status: 404,
          message: "Invalid or Expired OTP..",
        };
      }

      const getUser = await userModel.findOne({ deletedAt: null, email });
      //lean method is used to convert data into plain js object because we don't need anly operation on it.

      if (!getUser) {
        return {
          success: false,
          status: 404,
          message: "User not found.",
        };
      }

      // const secret = new TextEncoder().encode(process.env.SECRET_KEY);
      // const payload = {
      //   userId: getUser._id,
      //   role: getUser.role,
      // };
      // const accessToken = jwt.sign(payload, secret, {
      //   expiresIn: 1 * 60 * 60 * 1000,
      // });
      // const refreshToken = crypto.randomBytes(20).toString("hex");
      const { accessToken, refreshToken } = generateToken({
        userId: getUser._id,
        role: getUser.role,
      });
      getUser.refreshToken = refreshToken;
      await getUser.save();

      // removing otp after verification..
      await getOtpData.deleteOne();
      return {
        accessToken,
        refreshToken,
        getUser,
      };
    } catch (err) {
      logger.error("Error Occured in validateOTP service :: ", err);
      throw err;
    }
  }

  async resendOTP(data) {
    try {
      logger.log(data);
      const validationSchema = zSchema.pick({
        email: true,
      });

      const validateData = validationSchema.safeParse(data);

      if (!validateData.success) {
        return {
          success: false,
          status: 400,
          message: "Invalid or Missing Fields",
        };
      }

      const { email } = validateData.data;
      const getUser = await userModel
        .findOne({
          deletedAt: null,
          email,
        })
        .lean();

      if (!getUser) {
        return {
          success: false,
          status: 404,
          message: "User not Found..",
        };
      }

      //removing all otp;

      await OTPModel.deleteMany({ email });

      const otp = generateOTP();

      const newOTPData = new OTPModel({
        email,
        otp,
      });

      await newOTPData.save();

      const sendOTPStatus = await sendMail(
        "Your login Verification Code",
        email,
        otpEmailTemplate(otp)
      );

      if (!sendOTPStatus.success) {
        return {
          success: false,
          status: 400,
          message: "Unable to send OTP",
        };
      }
      return newOTPData;
    } catch (err) {
      logger.log("Erro occured in resendOtp service :: ", err);
      throw err;
    }
  }

  async forgetPasswordSentOTP(data) {
    try {
      const validationSchema = zSchema.pick({
        email: true,
      });

      const validatedData = validationSchema.safeParse(data);

      if (!validatedData) {
        return {
          success: false,
          status: 400,
          message: "Invalid or missing input fields..",
        };
      }

      const { email } = validatedData.data;

      const userData = await userModel
        .findOne({ deletedAt: null, email })
        .lean();

      if (!userData) {
        return {
          success: false,
          status: 404,
          message: "User not found",
        };
      }

      //removing all otp;

      await OTPModel.deleteMany({ email });

      const otp = generateOTP();

      const newOTPData = new OTPModel({
        email,
        otp,
      });

      await newOTPData.save();

      const sendOTPStatus = await sendMail(
        "Your login Verification Code",
        email,
        otpEmailTemplate(otp)
      );

      if (!sendOTPStatus.success) {
        return {
          success: false,
          status: 400,
          message: "Unable to send OTP",
        };
      }
      return newOTPData;
    } catch (err) {
      logger.error(
        "ERROR OCCURRED IN FORGET PASSWORD SENT OTP  SERVICE ::",
        err
      );
      throw err;
    }
  }

  async forgetPasswordValidateOTP(data) {
    try {
      // logger.log(data)
      const validatedSchema = zSchema.pick({
        otp: true,
        email: true,
      });

      const validateData = validatedSchema.safeParse(data);

      if (!validateData.success) {
        return {
          success: false,
          status: 400,
          message: "Invalid or Missing Field..",
        };
      }

      const { email, otp } = validateData.data;
      const getOtpData = await OTPModel.findOne({ email, otp });
      // logger.log(getOtpData);
      if (!getOtpData) {
        return {
          success: false,
          status: 404,
          message: "Invalid or Expired OTP..",
        };
      }

      const getUser = await userModel.findOne({ deletedAt: null, email });
      //lean method is used to convert data into plain js object because we don't need anly operation on it.

      if (!getUser) {
        return {
          success: false,
          status: 404,
          message: "User not found.",
        };
      }
      // removing otp after verification..
      await getOtpData.deleteOne();
      return getUser;
    } catch (err) {
      logger.error("Error Occured in validateOTP service :: ", err);
      throw err;
    }
  }

  async updatePassword(payload) {
    try {
      const validationSchema = zSchema.pick({
        email: true,
        password: true,
      });

      const validatedData = validationSchema.safeParse(payload);

      if (!validatedData) {
        return {
          success: false,
          status: 400,
          message: "Missing Input Fields..",
        };
      }

      const { email, password } = validatedData.data;

      const getUser = await userModel.findOne({ deletedAt: null, email });

      if (!getUser) {
        return {
          success: false,
          status: 400,
          message: "User doesn't exists.",
        };
      }

      getUser.password = password;
      await getUser.save();

      return getUser;
    } catch (err) {
      logger.error("ERROR OCCURED IN UPDATE PASSWORD SERVICE :: ", err);
      throw err;
    }
  }
}

export default new UserService();
