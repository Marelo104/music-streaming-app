import { Router } from "express";
import { 
    getAllPodcasts, 
    getPodcastById, 
    createPodcast, 
    addEpisode, 
    incrementEpisodePlays, 
    deletePodcast,
    deleteEpisode
} from "../controllers/podcast.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  uploadPodcastCover,
  uploadEpisodeAudio,
} from "../middleware/upload.middleware.js";

const router = Router()

router.get("/", getAllPodcasts)
router.get("/:id", getPodcastById)
router.post("/", 
    protectRoute, 
    uploadPodcastCover, 
    createPodcast
)
router.post("/:id/episodes", 
    protectRoute, 
    uploadEpisodeAudio, 
    addEpisode
)
router.patch("/:id/episodes/:episodeId/plays", incrementEpisodePlays)
router.delete("/:id", protectRoute, deletePodcast)
router.delete("/:id/:episodes/:episodeId", protectRoute, deleteEpisode)

export default router