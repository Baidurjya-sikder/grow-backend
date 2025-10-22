import mongoose, { isValidObjectId } from "mongoose";
import {User} from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  Toggle subscription to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user?._id;

    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    // Check if subscription already exists
    const existingSub = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    if (existingSub) {
        // Unsubscribe
        await existingSub.remove();
        return res
            .status(200)
            .json(new ApiResponse(200, null, "Unsubscribed successfully"));
    }

    // Subscribe
    const subscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, subscription, "Subscribed successfully"));
});

//  Get list of subscribers for a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username email avatar");

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Channel subscribers fetched successfully")
        );
});

//  Get list of channels the user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username email avatar");

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully")
        );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
