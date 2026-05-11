import { Router } from "express";
import { 
    createPlaylist, 
    getUserPlaylists, 
    getUserPlaylistsById, 
    addTrackToPlaylist, 
    removeTrackFromPlaylist, 
    deletePlaylist 
} from "../controllers/playlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/",protectRoute, createPlaylist)
router.get("/",protectRoute, getUserPlaylists)
router.get("/:id",protectRoute, getUserPlaylistsById)
router.post("/:id/tracks",protectRoute, addTrackToPlaylist)
router.delete("/:id/tracks/:trackId",protectRoute, removeTrackFromPlaylist)
router.delete("/:id",protectRoute, deletePlaylist)

export default router