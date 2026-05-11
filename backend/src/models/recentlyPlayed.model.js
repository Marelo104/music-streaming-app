import mongoose from "mongoose";

const recentlyPlayedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    track: {
      type: mongoose.Schema.Types.ObjectId,
      // refPath means mongoose looks at trackModel field to know which collection
      refPath: "trackModel",
    },
    // tells mongoose whether this is a Track or Episode
    trackModel: {
      type: String,
      enum: ["Track", "Episode"],
      default: "Track",
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
    lastPosition: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

recentlyPlayedSchema.index({ user: 1, track: 1 }, { unique: true });

export const RecentlyPlayed = mongoose.model("RecentlyPlayed", recentlyPlayedSchema);