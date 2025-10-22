import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  Create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user?._id;

    // TODO: create tweet
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    const tweet = await Tweet.create({
        content,
        owner: userId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

//  Get all tweets of a user
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // TODO: get user tweets
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })
        .populate("owner", "username avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

//  Update a tweet (only by owner)
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    // TODO: update tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content cannot be empty");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = content;
    await tweet.save();

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

//  Delete a tweet (only by owner)
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    // TODO: delete tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await tweet.remove();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
