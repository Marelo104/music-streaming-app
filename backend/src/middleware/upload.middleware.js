import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../lib/cloudinary.js";

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "soundwave/audio",
    resource_type: "video",
    allowed_formats: ["mp3", "wav", "ogg"],
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "soundwave/covers",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// for tracks — handles both audio + cover image
export const uploadTrack = multer({ storage: audioStorage }).fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

// for podcasts — only cover image
export const uploadPodcastCover = multer({ storage: imageStorage }).single("cover");

// for episodes — only audio
export const uploadEpisodeAudio = multer({ storage: audioStorage }).single("audio");

// single image — reusable for anything
export const uploadImage = multer({ storage: imageStorage }).single("image");