import mongoose from "mongoose";

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    host: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["tech", "business", "comedy", "health", "education", "other"],
      default: "other",
    },
    coverImage: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const episodeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    podcast: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Podcast",        // ✅ matches the model name exactly
      required: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    plays: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


podcastSchema.virtual('episodeCount', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'podcast',
  count: true,  // just return the count not the full documents
});

// make sure virtuals are included in JSON output
podcastSchema.set('toJSON', { virtuals: true });
podcastSchema.set('toObject', { virtuals: true });

export const Podcast = mongoose.model("Podcast", podcastSchema);
export const Episode = mongoose.model("Episode", episodeSchema);