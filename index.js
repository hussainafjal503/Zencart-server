import express from "express";
import dotenv from "dotenv";
import dbConnect, { DBDisconnect } from "./src/utils/dbConnect.js";
import ErrorHandler from "./src/Middleware/ErrorHandler.js";
import cors from "cors";

import userRouter from "./src/routes/user.Routes.js";
import { logger } from "./src/utils/logger.js";

dotenv.config();
const app = express();

let PORT = process.env.PORT || 4000;

// ************ Parsing middleware & cors Policy ********************//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ************** routes *******************//
const API_VERSION = "v1";

app.use(`/api/${API_VERSION}/user`, userRouter);

app.get("/", (req, res) => {
  res.end("welcome to home page");
});

// ************   error handling middleware *****//
app.use(ErrorHandler);

async function startSever() {
  try {
    await dbConnect();
    app.listen(PORT, () => {
      console.log(`server is running on ${PORT}`);
    });
  } catch (Err) {
    logger.error("UNABLE TO START SERVER : : ", Err);
  } finally {
    DBDisconnect();
  }
}
startSever();
 