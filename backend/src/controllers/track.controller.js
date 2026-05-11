import { Track } from "../models/track.model.js";
import { cloudinary } from "../lib/cloudinary.js";

export const getCategories = async (req, res) => {
  try {
    // get all unique genre values that actually exist in the DB
    const categories = await Track.distinct("genre");

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.log("Error in getCategories:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllTracks = async(req, res)=>{
    try {
        const tracks = await Track.find()
        .populate('uploadedBy', 'username image')  // replace ObjectId with actual user data
        .sort({ createdAt: -1 });                  // newest first

        return res.status(200).json({ success: true, tracks });
    } catch (error) {
        console.log("Error in getAllTracks:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getTrackById = async(req, res)=>{
    try {
        const track = await Track.findById(req.params.id)
        .populate('uploadedBy', 'username image');

        if (!track) {
            return res.status(404).json({ success: false, message: "Track not found" });
        }

        return res.status(200).json({ success: true, track });
    } catch (error) {
        console.log("Error in getTrackById:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deleteTrack = async(req, res)=>{
    try {
        const track = await Track.findById(req.params.id);

        if (!track) {
            return res.status(404).json({ success: false, message: "Track not found" });
        }

        // only the uploader or an admin can delete
        if (track.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // delete files from Cloudinary too — don't leave orphaned files
        if (track.audioUrl) {
            const publicId = track.audioUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`soundwave/audio/${publicId}`, { resource_type: 'video' });
        }

        if (track.coverImage) {
            const publicId = track.coverImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`soundwave/covers/${publicId}`);
        }

        await Track.findByIdAndDelete(req.params.id);

        return res.status(200).json({ success: true, message: "Track deleted successfully" });
    } catch (error) {
        console.log("Error in deleteTrack:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const incrementPlays = async(req, res)=>{
    try {
        const track = await Track.findByIdAndUpdate(
            req.params.id,
            { $inc: { plays: 1 } },  // $inc adds 1 without fetching the doc first
            { returnDocument: 'after' }
        );

        if (!track) {
            return res.status(404).json({ success: false, message: "Track not found" });
        }

        return res.status(200).json({ success: true, plays: track.plays });
    } catch (error) {
        console.log("Error in incrementPlays:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}