import { logger } from "./logger.js";

class APIError extends Error {
  constructor(message, statusCode) {

    logger.log("API CLAss", message,statusCode)
    super(message);
    this.status = statusCode;
  }
}

export default APIError;
