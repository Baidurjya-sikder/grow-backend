import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//  Apply verifyJWT middleware to all routes in this file
// This ensures all tweet routes require a valid JWT token for authentication
router.use(verifyJWT);

//  Routes
// Create a new tweet
router.route("/").post(createTweet);

// Get all tweets from a specific user
router.route("/user/:userId").get(getUserTweets);

// Update or delete a specific tweet
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
