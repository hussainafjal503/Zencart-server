import APIError from "../utils/ErrorClass.js";
import { logger } from "../utils/logger.js";
import responseProvider from "../utils/responseFunction.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  try {
    // const authHeader = req.headers.authorization || req.cookies;
    const authHeader = req.cookies;
    logger.log("auth Header", authHeader);

    if (!authHeader || !authHeader?.accessToken) {
      return responseProvider(res, false, 401, "Unauthorized: Access");
    }

    const token = authHeader?.accessToken;
    const secret = new TextEncoder().encode(process.env.SECRET_KEY);

    const decode = jwt.verify(token, secret);

    if (!decode) {
      return responseProvider(res, false, 401, "Invalid or Expired Token");
    }

    (req.userId = decode.userId), (req.role = decode.role);
    next();
  } catch (err) {
    logger.error("ERROR OCCURED IN AUTHENTICATION MIDDLEWARE : ", err);
    return next(new APIError("Internal server error ", 500));
  }
};

export const isAdmin = (req, res, next) => {
  try {
    const role = req.role;
    if (role !== "admin") {
      return responseProvider(res, false, 400, "Unauthorized access");
    }

    next();
  } catch (err) {
    logger.error("ERROR OCCURED IN AUTHORIZTION MIDDLEWARE :: ", err);
    return next(new APIError("Internal server Error ", 500));
  }
};
