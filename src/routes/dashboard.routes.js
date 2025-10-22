import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//  Apply verifyJWT middleware to all routes in this file
router.use(verifyJWT);

//  Routes
// Route to get statistics of the logged-in user's channel
router.route("/stats").get(getChannelStats);

// Route to get all videos of the logged-in user's channel
router.route("/videos").get(getChannelVideos);

export default router;
