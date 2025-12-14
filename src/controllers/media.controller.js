import APIError from "../utils/ErrorClass.js";
import { logger } from "../utils/logger.js";
import responseProvider from "../utils/responseFunction.js";
import mediaService from "../services/media.service.js";

class MediaController {
  async createMedia(req, res, next) {
    try {
      const mediaResponse = await mediaService.createMedia(req.body);

      if (mediaResponse.success === false) {
        return responseProvider(
          res,
          mediaResponse.success,
          mediaResponse.status,
          mediaResponse.message
        );
      }

      responseProvider(
        res,
        true,
        200,
        "Uploaded successfully..",
        mediaResponse
      );
    } catch (err) {
      logger.error("ERROR OCCURED IN CREATE MEDIA CONTROLLER :: ", err);
      return next(new APIError("Internal server Error", 500));
    }
  }
}

export default new MediaController();
