import { Track } from "../models/track.model.js";
import { Playlist } from "../models/playlist.model.js";

export const search = async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const [tracks, playlists] = await Promise.all([
      Track.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { artist: { $regex: q, $options: 'i' } },
        ],
      }).populate('uploadedBy', 'username image'),

      Playlist.find({
        name: { $regex: q, $options: 'i' },
        isPublic: true,
      }).populate('createdBy', 'username image'),
    ]);

    return res.status(200).json({ success: true, tracks, playlists });
  } catch (error) {
    console.log("Error in search:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};