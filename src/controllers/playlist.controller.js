import mongoose, {isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user?._id;

    // TODO: create playlist
    if (!name) {
        throw new ApiError(400, "Playlist name is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId,
        videos: []
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

//  Get all playlists of a user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});

//  Get a playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId).populate("videos");
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

//  Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

//  Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    playlist.videos = playlist.videos.filter(v => v.toString() !== videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});

//  Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

//  Update a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
