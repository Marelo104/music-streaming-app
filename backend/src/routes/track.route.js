import { Router } from "express";
import { 
    getCategories, 
    getAllTracks, 
    getTrackById, 
    deleteTrack, 
    incrementPlays 
} from "../controllers/track.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadTrack } from "../middleware/upload.middleware.js";

const router = Router()

router.get("/categories", getCategories);
router.get("/", getAllTracks)
router.get("/:id", getTrackById)
router.patch("/:id/plays", incrementPlays)
router.delete("/:id", protectRoute, deleteTrack)

export default router