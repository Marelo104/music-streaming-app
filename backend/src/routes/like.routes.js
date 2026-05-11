import { Router } from "express";
import { getLikedTracks, likeTrack } from "../controllers/like.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getLikedTracks)
router.post("/:trackId", protectRoute, likeTrack)

export default router