import APIError from "../utils/ErrorClass.js";
import { logger } from "../utils/logger.js";
import mediaModel from "../Models/media.model.js";
import cloudinary from "../config/cloudinaryConfig.js";

class MediaService {
  async createMedia(data) {
    try {
      const payload = data;
      const newMedia = await mediaModel.insertMany(payload);

      if (!newMedia) {
        if (payload && payload.length > 0) {
          const public_ids = payload.map((data) => data.public_id);

          try {
            await cloudinary.api.delete_resources(public_ids);
          } catch (err) {
            logger.error("ERROR OCCURED WHILE DELETING MEDIA FROM CLOUDINARY");
            throw (err.cloudinary = "not deleted..");
          }
        }

        return {
          success: false,
          status: 400,
          message: "Unable to add Media",
        };
      }

      return newMedia;
    } catch (err) {
      logger.error("ERROR OCCURED IN CREATE MEDIA SERVICE :: ", err);
      throw err;
    }
  }






  
}

export default new MediaService();
