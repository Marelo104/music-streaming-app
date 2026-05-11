import { Playlist } from "../models/playlist.model.js" 
import { Track } from "../models/track.model.js";

export const createPlaylist = async(req, res)=>{
    try {
        const { name, description, isPublic } = req.body
        if(!name){
            return res.status(400).json({ message: "field are required" });
        }

        const playlist = await Playlist.create({
            createdBy: req.user._id,
            name,
            description,
            isPublic
        })

        res.status(201).json(playlist);
    } catch (error) {
        console.log("Error in createPlaylist:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


export const getUserPlaylistsById = async(req, res)=>{
    try {
        const playlist = await Playlist.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        }).populate('tracks', 'title artist duration coverImage audioUrl');

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

         res.json({ success: true, playlist }); 
    } catch (error) {
        console.log("Error in getUserPlaylistsById:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const addTrackToPlaylist = async(req, res)=>{
    try {
        const { trackId } = req.body;

        const playlist = await Playlist.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        })
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        const track = await Track.findById(trackId);
        if (!track) {
            return res.status(404).json({ success: false, message: 'Track not found' });
        }

        if (!playlist.tracks.includes(trackId)) {
            playlist.tracks.push(trackId);
            await playlist.save();
        }

        res.json({ success: true, playlist });
    } catch (error) {
        console.log("Error in addTrackToPlaylist:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const removeTrackFromPlaylist = async(req, res)=>{
    try {
        const playlist = await Playlist.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });
        if (!playlist) {
        return res.status(404).json({ success: false, message: 'Playlist not found' });
        }
    
        playlist.tracks = playlist.tracks.filter(
        track => track.toString() !== req.params.trackId
        );
        await playlist.save();

        res.json({ success: true, playlist });
    } catch (error) {
        console.log("Error in removeTrackFromPlaylist:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deletePlaylist = async(req, res)=>{
    try {
        const playlist = await Playlist.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }
    
        res.json({ success: true, message: 'Playlist deleted' });
    } catch (error) {
        console.log("Error in deletePlaylist:", error.message);
        res.status(500).json({ success: false, message: "Server error" });  
    }
}

export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ createdBy: req.user._id })
      .populate("tracks", "title artist duration coverImage audioUrl");

    if(playlists.length === 0){
        return res.status(400).json({ success: false, message: "No playlist found" })
    }

    res.json({ success: true, playlists });
  } catch (error) {
    console.log("Error in getUserPlaylists:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};