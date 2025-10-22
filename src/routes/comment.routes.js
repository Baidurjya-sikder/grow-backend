import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//  Apply verifyJWT middleware to all routes in this file
router.use(verifyJWT);

//  Routes
// Get all comments of a video & Add new comment to a video
router.route("/:videoId").get(getVideoComments).post(addComment);  // add a new comment to that video

// Update or Delete a specific comment
router
    .route("/c/:commentId").patch(updateComment).delete(deleteComment); // delete a specific comment

export default router;
