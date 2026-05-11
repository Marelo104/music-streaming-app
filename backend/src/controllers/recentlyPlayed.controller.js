import { RecentlyPlayed } from "../models/recentlyPlayed.model.js";

export const updateRecentlyPlayed = async (req, res) => {
  try {
    const { trackId, lastPosition, trackModel = "Track" } = req.body;

    if (!trackId) {
      return res.status(400).json({ success: false, message: "trackId is required" });
    }

    const entry = await RecentlyPlayed.findOneAndUpdate(
      { user: req.user._id, track: trackId },
      { lastPosition, playedAt: Date.now(), trackModel },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(200).json({ success: true, entry });
  } catch (error) {
    console.log("Error in updateRecentlyPlayed:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRecentlyPlayed = async (req, res) => {
  try {
    const history = await RecentlyPlayed.find({ user: req.user._id })
      .populate({
        path: "track",
        select: "title artist duration coverImage audioUrl",
      })
      .sort({ playedAt: -1 })
      .limit(20);

    // filter out entries where track was deleted
    const validHistory = history.filter((item) => item.track !== null);

    // also delete the orphaned entries from DB automatically
    const orphanedIds = history
      .filter((item) => item.track === null)
      .map((item) => item._id);

    if (orphanedIds.length > 0) {
      await RecentlyPlayed.deleteMany({ _id: { $in: orphanedIds } });
    }

    res.status(200).json({ success: true, history: validHistory });
  } catch (error) {
    console.log("Error in getRecentlyPlayed:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLastPosition = async (req, res) => {
  try {
    const entry = await RecentlyPlayed.findOne({
      user: req.user._id,
      track: req.params.trackId,
    });

    const lastPosition = entry ? entry.lastPosition : 0;
    res.status(200).json({ success: true, lastPosition });
  } catch (error) {
    console.log("Error in getLastPosition:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};