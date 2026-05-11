import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		artist: {
			type: String,
			required: true,
		},
		album: {
			type: String,
			default: 'Single'
  		},
		coverImage: {
			type: String,
			default: "",
		},
		audioUrl: {
			type: String,
			required: true,
		},
		duration: {
			type: Number,
			required: true,
		},
		genre: {
			type: String,
			enum: ['pop', 'hip-hop', 'afrobeats', 'jazz', 'classical', 'r&b', 'other'],
			default: 'other',
		},
		plays: {
			type: Number,
			default: 0
  		},
		uploadedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

export const Track = mongoose.model("Track", trackSchema );