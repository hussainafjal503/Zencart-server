import nodmailer from "nodemailer";
import dotenv from "dotenv";
import { logger } from "./logger.js";
dotenv.config();

const sendMail = async (subject, receiver, body) => {
  const traspoter = nodmailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const options = {
    from: `Afjal Hussain < ${process.env.NODEMAILER_EMAIL}>`,
    to: receiver,
    subject: subject,
    html: body,
  };

  try {
    await traspoter.sendMail(options);
    return {
      success: true,
    };
  } catch (err) {
    logger.error("error occured while sending the mail :: ", err);

    return { success: false, message: err.message };
    // throw new APIError("Internal Server Error, Unable to send Mail",500)
  }
};

export default sendMail;
