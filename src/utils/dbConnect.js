import mongoose from "mongoose";
import { logger } from "./logger.js";
import APIError from "./ErrorClass.js";

let cache = global.mongoose;

if (!cache) {
  cache = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {
  if (cache.conn) return cache.conn;

  try {
    if (!cache.promise) {
      cache.promise = mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false,
      });
    }

    cache.conn = await cache.promise;
    console.log("db Connected.. successFully...");
    return cache.conn;
  } catch (err) {
    console.error("unable to connect with DB ==> ", err);
    throw new APIError("Internal Server Error, Please Try after some time.");
  }
}

export const DBDisconnect = async () => {
  try {
    if (cache) {
      cache = null;
    }
    await mongoose.disconnect();
    logger.log("DB disconneted..");
  } catch (err) {
    logger.error("ERROR OCCURED WHILE DISCONNECTING THE DB: ", err);
    throw new APIError("Internal Server Error, Please Try after some time.");
  }
};

export default dbConnect;
