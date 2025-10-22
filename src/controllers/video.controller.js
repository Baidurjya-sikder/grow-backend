import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//  Get all videos with query, sort, and pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    // TODO: get all videos based on query, sort, pagination
    const filter = {};
    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }
    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sortOptions = { [sortBy]: sortType === "desc" ? -1 : 1 };

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("owner", "username avatar");

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        videos,
        totalVideos,
        page: Number(page),
        limit: Number(limit)
    }, "Videos fetched successfully"));
});

//  Publish a video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user?._id;

    // TODO: get video, upload to cloudinary, create video
    if (!title || !req.file) {
        throw new ApiError(400, "Title and video file are required");
    }

    const uploadedVideo = await uploadOnCloudinary(req.file.path, "videos");

    const video = await Video.create({
        title,
        description,
        owner: userId,
        videoUrl: uploadedVideo.secure_url,
        publicId: uploadedVideo.public_id,
        isPublished: true
    });

    return res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});

//  Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username avatar");
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

//  Update video details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const userId = req.user?._id;

    // TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    if (title) video.title = title;
    if (description) video.description = description;
    if (req.file) {
        const uploadedThumbnail = await uploadOnCloudinary(req.file.path, "thumbnails");
        video.thumbnailUrl = uploadedThumbnail.secure_url;
        video.thumbnailPublicId = uploadedThumbnail.public_id;
    }

    await video.save();
    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

//  Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    // TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }

    await video.remove();
    return res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

//  Toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to change publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    const message = video.isPublished ? "Video published successfully" : "Video unpublished successfully";
    return res.status(200).json(new ApiResponse(200, video, message));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
