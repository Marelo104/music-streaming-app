import express from "express"
import dotenv from "dotenv"
import cookieParser from 'cookie-parser';
import path from "path"

import { connectDB } from "./lib/db.js"

import adminRoutes from "./routes/admin.route.js"
import authRoutes from "./routes/auth.route.js"
import trackRoutes from "./routes/track.route.js"
import podcastRoutes from "./routes/podcast.route.js"
import playlistRoutes from "./routes/playlist.route.js"
import statRoutes from "./routes/stat.route.js"
import searchRoutes from "./routes/search.route.js"
import recentlyPlayedRoutes from "./routes/recentlyPlayed.routes.js"
import likeRoutes from "./routes/like.routes.js"


dotenv.config();

const app = express()
const PORT = process.env.PORT || 8000

const __dirname = path.resolve();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));

  app.use((req, res) => {
    res.sendFile(
      path.resolve(__dirname, "frontend/dist/index.html")
    );
  });
}

// routes
app.use("/api/auth", authRoutes)
app.use("/api/tracks", trackRoutes)
app.use("/api/podcasts", podcastRoutes)
app.use("/api/playlists", playlistRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/stats", statRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/recently-played", recentlyPlayedRoutes)
app.use("/api/likes", likeRoutes)

app.listen(PORT, ()=>{
    console.log("Server is running on PORT " + PORT)
    connectDB() 
})