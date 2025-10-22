import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  Get channel statistics (views, subscribers, videos, likes)
const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    // 1 Total videos uploaded
    const totalVideos = await Video.countDocuments({ owner: userId });

    // 2 Total views across all videos
    const viewsData = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);
    const totalViews = viewsData[0]?.totalViews || 0;

    // 3 Total subscribers (count subscriptions where channel = userId)
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    // 4 Total likes across all user videos
    const videoIds = await Video.find({ owner: userId }).select("_id");
    const totalLikes = await Like.countDocuments({
        video: { $in: videoIds.map(v => v._id) }
    });

    //  Combine stats
    const stats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel statistics fetched successfully"));
});

//  Get all videos uploaded by the logged-in channel
const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 }) // newest first
        .populate("owner", "username avatar email"); // optional: show channel info

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export {
    getChannelStats,
    getChannelVideos
};
