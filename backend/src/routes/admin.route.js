import { Router } from "express";
import { 
    getAllUsers, 
    deleteAnyPodcast, 
    deleteAnyTrack, 
    toggleUserRole,
    createTrack,
    searchFromAudioDB,
    deleteRecentlyPlayed
} from "../controllers/admin.controller.js";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import { uploadTrack } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/users", protectRoute, adminOnly, getAllUsers);
router.post("/", protectRoute, adminOnly, uploadTrack, createTrack);
router.delete("/tracks/:id", protectRoute, adminOnly, deleteAnyTrack);
router.delete("/podcasts/:id", protectRoute, adminOnly, deleteAnyPodcast);
router.patch("/users/:userId/role", protectRoute, adminOnly, toggleUserRole);
router.delete("/recently-played/:id", protectRoute, adminOnly, deleteRecentlyPlayed);
router.get("/search", protectRoute, adminOnly, searchFromAudioDB);

export default router