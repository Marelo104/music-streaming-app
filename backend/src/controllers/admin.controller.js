import axios from "axios";
import { User } from "../models/user.model.js"
import { Track } from "../models/track.model.js";
import { RecentlyPlayed } from "../models/recentlyPlayed.model.js";
import { Podcast, Episode } from "../models/podcast.model.js";  
import { cloudinary } from "../lib/cloudinary.js"; 


export const createTrack = async (req, res) => {
    try {
        const { title, artist, album, genre, duration, coverImage } = req.body;

        if (!title || !artist || !duration) {
            return res.status(400).json({ success: false, message: "Title, artist and duration are required" });
        }

        // multer puts file info on req.files
        if (!req.files?.audio) {
            return res.status(400).json({ success: false, message: "Audio file is required" });
        }

        // Cloudinary URLs come back on the multer file object
        const audioUrl = req.files.audio[0].path;
        // const coverImage = req.files?.cover ? req.files.cover[0].path : "";
        const cover = req.files?.cover
        ? req.files.cover[0].path   // uploaded file
        : coverImage || ""; 

        const track = new Track({
            title,
            artist,
            album,
            genre,
            duration: Number(duration),
            audioUrl,
            cover,
            uploadedBy: req.user._id,  // from protectRoute middleware
        });

        await track.save();

        return res.status(201).json({
            success: true,
            message: "Track uploaded successfully",
            track,
        });
    } catch (error) {
        console.log("Error in createTrack:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllUsers = async(req, res)=>{
    try {
        const users = await User.find({ role: "user" }).select("-password")
        if(users.length === 0){
            return res.status(400).json({ success: false, message: "No users found" })
        }
        res.status(200).json({ success: true, users }); 
    } catch (error) {
        console.log("Error in getAllUsers:", error.message);
        res.status(500).json({ success: false, message: "Server error" });         
    }
}

export const deleteAnyTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: "Track not found" });
    }

    // delete recently played entries for this track
    await RecentlyPlayed.deleteMany({ track: req.params.id });

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
    console.log("Error in deleteAnyTrack:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteRecentlyPlayed = async(req, res)=>{
    try {
        const id = req.params.id

        const RecentlyPlayed = await RecentlyPlayed.findById(id)
        if (!RecentlyPlayed) {
            return res.status(404).json({ success: false, message: "RecentlyPlayed not found" });
        }

        await RecentlyPlayed.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "RecentlyPlayed deleted successfully" });
    } catch (error) {
        console.log("Error in deleteRecentlyPlayed:", error.message);
        res.status(500).json({ success: false, message: "Server error" });          
    }
}

export const deleteAnyPodcast = async(req, res)=>{
    try {
        const id = req.params.id

        const podcast = await Podcast.findById(id)
        if (!podcast) {
            return res.status(404).json({ success: false, message: "Podcast not found" });
        }

        await Episode.deleteMany({ podcast: id })
        await Podcast.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Podcast deleted successfully" });
    } catch (error) {
        console.log("Error in deleteAnyPodcast:", error.message);
        res.status(500).json({ success: false, message: "Server error" });          
    }
}

export const toggleUserRole = async(req, res)=>{
    try {
        const userId = req.params.userId

        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({ success: false, message: "User not find"})
        }

        const newRole = user.role === "admin" ? "user" : "admin";

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role: newRole },
            { returnDocument: 'after' }
        ).select("-password");
        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.log("Error in toggleUserRole:", error.message);
        res.status(500).json({ success: false, message: "Server error" });          
    }
}


export const searchFromAudioDB = async (req, res) => {
  try {
    const { q } = req.query;
    console.log(q)
    if (!q) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    // your backend calls TheAudioDB
    const response = await axios.get(
      `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${q}`
    );

    
    const tracks = response.data.track;

    if (!tracks) {
      return res.status(404).json({ success: false, message: "No results found" });
    }

    // clean up only the fields you need
    const formatted = tracks.map((track) => ({
      title: track.strTrack,
      artist: track.strArtist,
      album: track.strAlbum,
      genre: track.strGenre,
      coverImage: track.strTrackThumb,
    }));

    return res.status(200).json({ success: true, tracks: formatted });
  } catch (error) {
    console.log("Error in searchFromAudioDB:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};