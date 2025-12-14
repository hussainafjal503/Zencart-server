import express from "express";
import mediaController from "../controllers/media.controller.js";
import { isAdmin, isAuthenticated } from "../Middleware/AuthenticationMiddleware.js";
const mediaRouter = express.Router();

mediaRouter.post("/media-upload",isAuthenticated, isAdmin, mediaController.createMedia);



export default mediaRouter;
