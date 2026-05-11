import { Router } from "express";
import { 
    getRecentlyPlayed, 
    updateRecentlyPlayed, 
    getLastPosition,
} from "../controllers/recentlyPlayed.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router()

router.get("/", protectRoute, getRecentlyPlayed)
router.post("/", protectRoute, updateRecentlyPlayed)
router.get("/:trackId", protectRoute, getLastPosition)

export default router