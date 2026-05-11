import { Podcast, Episode } from "../models/podcast.model.js";
import { RecentlyPlayed } from "../models/recentlyPlayed.model.js";

export const createPodcast = async (req, res) => {
  try {
    const { title, host, description, category } = req.body;

    if (!title || !host) {
      return res.status(400).json({ success: false, message: "Title and host are required" });
    }

    // req.file comes from uploadPodcastCover multer middleware
    // if no cover uploaded, default to empty string
    const coverImage = req.file ? req.file.path : "";

    const podcast = await Podcast.create({
      title,
      host,
      description,
      category,
      coverImage,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, podcast });
  } catch (error) {
    console.log("Error in createPodcast:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find()
      .populate("uploadedBy", "username image")
      .populate("episodeCount"); // ← populate the virtual count

    res.json({ success: true, podcasts });
  } catch (error) {
    console.log("Error in getAllPodcasts:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPodcastById = async(req, res) =>{
    try {
        const id = req.params.id 
        const [podcast, episodes] = await Promise.all([
            Podcast.findById(id),
            Episode.find({ podcast: id }).sort({ episodeNumber: 1 })
        ])
        if (!podcast) {
            return res.status(404).json({ success: false, message: 'podcast not found' });
        }

        res.json({ success: true, podcast, episodes }); 
    } catch (error) {
        console.log("Error in getPodcastById:", error.message);
        res.status(500).json({ success: false, message: "Server error" });         
    }
}

export const addEpisode = async (req, res) => {
  try {
    const { title, description, episodeNumber, duration } = req.body;
    const podcastId = req.params.id;

    if (!title || !episodeNumber) {
      return res.status(400).json({ success: false, message: "Title and episode number are required" });
    }

    // req.file comes from uploadEpisodeAudio multer middleware
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Audio file is required" });
    }

    const audioUrl = req.file.path;

    // check podcast exists and user owns it
    const podcast = await Podcast.findOne({
      _id: podcastId,
      uploadedBy: req.user._id,
    });

    if (!podcast) {
      return res.status(404).json({ success: false, message: "Podcast not found or not authorized" });
    }

    const episode = await Episode.create({
      title,
      description,
      episodeNumber: Number(episodeNumber),
      duration: Number(duration) || 0,
      audioUrl,
      podcast: podcastId,
    });

    res.status(201).json({ success: true, episode });
  } catch (error) {
    console.log("Error in addEpisode:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const incrementEpisodePlays = async(req, res) =>{
    try {
        const episode = await Episode.findByIdAndUpdate(
            req.params.id,
            { $inc: { plays: 1 } },  // $inc adds 1 without fetching the doc first
            { returnDocument: 'after' }
        );

        if (!episode) {
            return res.status(404).json({ success: false, message: "Episode not found" });
        }

        return res.status(200).json({ success: true, plays: episode.plays });
    } catch (error) {
        console.log("Error in incrementEpisodePlays:", error.message);
        res.status(500).json({ success: false, message: "Server error" });         
    }
}


export const deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ success: false, message: "Podcast not found" });
    }

    if (podcast.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // get all episode ids before deleting
    const episodes = await Episode.find({ podcast: req.params.id });
    const episodeIds = episodes.map((ep) => ep._id);

    // delete recently played entries for all episodes
    await RecentlyPlayed.deleteMany({ track: { $in: episodeIds } });

    // delete all episodes
    await Episode.deleteMany({ podcast: req.params.id });

    // delete the podcast
    await Podcast.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Podcast deleted successfully" });
  } catch (error) {
    console.log("Error in deletePodcast:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteEpisode = async (req, res) => {
  try {
    const { episodeId, id } = req.params;

    const episode = await Episode.findById(episodeId);
    if (!episode) {
      return res.status(404).json({ success: false, message: "Episode not found" });
    }

    const podcast = await Podcast.findById(id);
    if (!podcast) {
      return res.status(404).json({ success: false, message: "Podcast not found" });
    }

    if (podcast.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // delete recently played entries for this episode
    await RecentlyPlayed.deleteMany({ track: episodeId });

    await Episode.findByIdAndDelete(episodeId);
    return res.status(200).json({ success: true, message: "Episode deleted successfully" });
  } catch (error) {
    console.log("Error in deleteEpisode:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};