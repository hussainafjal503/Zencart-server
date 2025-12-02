import { logger } from "./logger.js";

const responseProvider = (res, success, status, message, data = {}) => {
  try {
    logger.log(success, status, message, data);
    return res.status(status).json({
      message,
      success,
      data,
    });
  } catch (err) {
    logger.error("error occured in response Provider :; ", err);
  }
};

export default responseProvider;
