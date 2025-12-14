import mongoose from "mongoose";
import { logger } from "./logger.js";
import APIError from "./ErrorClass.js";

async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.log("db Connected.. successFully...");
  } catch (err) {
    logger.error("unable to connect with DB ==> ", err);
    throw new APIError("Internal Server Error, Please Try after some time.");
  }
}

export const DBDisconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.log("DB disconneted..");
  } catch (err) {
    logger.error("ERROR OCCURED WHILE DISCONNECTING THE DB: ", err);
    throw new APIError("Internal Server Error, Please Try after some time.");
  }
};

export default dbConnect;
