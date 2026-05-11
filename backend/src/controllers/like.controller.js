import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";

export const likeTrack = async (req, res) => {
  try {
    const trackId = req.params.trackId;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isLiked = user.likedTracks.some(
      (id) => id.toString() === trackId.toString()
    );

    let update;
    let message;
    if (isLiked) {
      // unlike — remove from likedTracks
      update = { $pull: { likedTracks: trackId } };
      message = "unlike successfully"
    } else {
      // like — add to likedTracks
      update = { $addToSet: { likedTracks: trackId } };
       message = "Like successfully"
    }

    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true })
      .populate("likedTracks", "title artist duration coverImage audioUrl");

    // find or create the user's "Liked Songs" playlist
    let likedPlaylist = await Playlist.findOne({
      createdBy: userId,
      isLikedSongs: true,   // special flag we add to model
    });

    if (!likedPlaylist) {
      // create the liked songs playlist if it doesn't exist yet
      likedPlaylist = await Playlist.create({
        name: "Liked Songs",
        createdBy: userId,
        isLikedSongs: true,
        isPublic: false,
      });
    }

    if (isLiked) {
      // unlike — remove from playlist
      likedPlaylist.tracks = likedPlaylist.tracks.filter(
        (id) => id.toString() !== trackId.toString()
      );
    } else {
      // like — add to playlist
      likedPlaylist.tracks.addToSet(trackId);
    }

    await likedPlaylist.save();

    return res.status(200).json({
      success: true,
      liked: !isLiked,
      message,
      likedTracks: updatedUser.likedTracks,
    });
  } catch (error) {
    console.log("Error in likeTrack:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLikedTracks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("likedTracks", "title artist duration coverImage audioUrl");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, likedTracks: user.likedTracks });
  } catch (error) {
    console.log("Error in getLikedTracks:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};