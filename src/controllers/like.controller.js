import mongoose, {isValidObjectId} from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  Toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if like already exists
    const existingLike = await Like.findOne({ user: userId, video: videoId });

    if (existingLike) {
        // Remove like
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"));
    }

    // Add like
    const like = await Like.create({ user: userId, video: videoId });
    return res.status(201).json(new ApiResponse(201, like, "Video liked successfully"));
});

//  Toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({ user: userId, comment: commentId });

    if (existingLike) {
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"));
    }

    const like = await Like.create({ user: userId, comment: commentId });
    return res.status(201).json(new ApiResponse(201, like, "Comment liked successfully"));
});

//  Toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({ user: userId, tweet: tweetId });

    if (existingLike) {
        await existingLike.remove();
        return res.status(200).json(new ApiResponse(200, null, "Tweet unliked successfully"));
    }

    const like = await Like.create({ user: userId, tweet: tweetId });
    return res.status(201).json(new ApiResponse(201, like, "Tweet liked successfully"));
});

//  Get all liked videos of the logged-in user
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    // Find all likes where user liked a video
    const likedVideos = await Like.find({ user: userId, video: { $exists: true } })
        .populate("video", "title description owner createdAt"); // optional: populate video info

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
