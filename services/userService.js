import { z } from "zod";
import { zSchema } from "../config/zodSchema.js";
import userModel from "../Models/user.model.js";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import crypto from "crypto"; 



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
          statusCode: 400,
          message: "Invalid or Missing Input Fields.. ",
        };
      }

      const { name, email, password } = validatedData.data;
      //validation for user already exists..
      const checkUser = await userModel.exists({ email });
      if (checkUser) {
        return {
          success: false,
          statusCode: 409,
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
          statusCode: 400,
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
          statusCode: 404,
          message: "User not found.",
        };
      }

      userDetail.isEmailVerified = true;

      const payload = {
        userId: userDetail._id,
        role: userDetail.role,
      };
      const accessToken = jwt.sign(payload, secret, {
        expiresIn: 1 * 60 * 60 * 1000,
      });
      const refreshToken = crypto.randomBytes(20).toString("hex");
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
}

export default new UserService();
