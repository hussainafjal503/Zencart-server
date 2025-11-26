import express from "express";
import dotenv from "dotenv";
import dbConnect from "./utils/dbConnect.js";
import ErrorHandler from "./Middleware/ErrorHandler.js";
import cors from "cors";

import userRouter from "./routes/user.Routes.js";

dotenv.config();
const app = express();

let PORT = process.env.PORT || 4000;

await dbConnect();

// ************  middleware ********************//
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
app.use("/api/v1/user", userRouter);

app.get("/", (req, res) => {
  res.end("welcome to home page");
});

// ************   error handling middleware *****//
app.use(ErrorHandler);

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
