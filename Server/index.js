import express, { json, response } from "express";
import morgan from "morgan";
import pkg from "pg";
const { Pool } = pkg;
import {
  initializeDatabase,
  getVideos,
  newUser,
  addVideo,
  deleteVideo,
} from "./elephantSQL.js";
import { search, getCredentials, getStreamerId } from "./twitch.js";

const pool = new Pool({
  connectionString:
    "postgres://qbxcnxsv:88mjutdU5-eF8PaSgMtCtOZOe5BU4mml@berry.db.elephantsql.com/qbxcnxsv",
});

pool.connect((err, client, done) => {
  if (err) {
    console.log("Error connecting to database", err);
  } else {
    console.log("Connected to database");
  }
});

initializeDatabase(pool);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static("Client"));

////////////////////////
//// Twitch Routes /////
////////////////////////

/**
 * Get videos from Twitch
 * @param {String} req.query.name
 * @returns {JSON} videos or 400 error
 */
app.get("/videos", async (req, res) => {
  const streamerName = req.query.name;
  // Check if name is valid
  if (streamerName === undefined) {
    res.status(400).send("Invalid Parameters");
  } else {
    try {
      // Get streamer id
      const streamerData = await getStreamerId(streamerName);
      const streamerInfo = await streamerData.json();
      if (streamerInfo.data.length !== 1) {
        throw new Error("Streamer does not exist");
      }
      // Get videos
      const videos = await search(streamerInfo.data[0].id);
      if (videos.length === 0) {
        throw new Error("No Collab Videos Found");
      }
      res.status(200).send(videos);
    } catch (error) {
      console.log("Failed to get videos: " + error.message);
      res.status(400).send(error.message);
    }
  }
});

/**
 * Get Twitch credentials
 * @returns 200 or 400 error
 */
app.post("/credentials", async (req, res) => {
  try {
    await getCredentials();
    res.status(200).send("Success");
  } catch (error) {
    console.log("Failed to get Twitch credentials: " + error);
    res.status(400).send(error.message);
  }
});

////////////////////////
// ElephantSQL Routes //
////////////////////////

/**
 * Get all videos from user
 * @param {int} req.query.id
 * @returns {JSON} videos or 400 error
 */
app.get("/user/videos", async (req, res) => {
  const userID = req.query.id;
  if (userID === undefined) {
    res.status(400).send("Invalid Parameters");
  } else {
    try {
      // Get videos from Database
      const data = await getVideos(userID, pool);
      res.status(200).send(await data.rows);
    } catch (error) {
      console.log("Failed to get videos error: " + error);
      res.status(400).send(error.message);
    }
  }
});

/**
 * Create new user
 * @param {int} req.query.id
 * @returns 200 or 400 error
 */
app.put("/user", async (req, res) => {
  const userID = req.query.id;
  if (userID === undefined) {
    res.status(400).send("Invalid Parameters");
  } else {
    try {
      // Send Id to Database
      const data = await newUser(userID, pool);
      res.status(200).send(await data.rows);
    } catch (error) {
      console.log("Create User error: " + error);
      res.status(400).send(error.message);
    }
  }
});

/**
 * Add video to user's video list
 * @param {int} req.query.id
 * @param {*} req.body {video}
 * @returns 200 or 400 error
 */
app.post("/user/videos", async (req, res) => {
  const UserID = req.query.id;
  const video = req.body;
  if (UserID === undefined || video === undefined) {
    res.status(400).send("Invalid Parameters");
  } else {
    try {
      // Send video to database
      const data = await addVideo(UserID, video, pool);
      res.status(200).send(await data);
    } catch (error) {
      console.log("Failed to add video to user list: " + error);
      res.status(400).send(error.message);
    }
  }
});

/**
 * Delete video from user's video list
 * @param {int} req.query.id
 * @param {*} req.query.videoID
 * @returns 200 or 400 error
 */
app.delete("/user/videos", async (req, res) => {
  const userID = req.query.id;
  const videoID = req.query.videoID;
  // console.log("id: " + userID + " videoID: " + videoID);
  if (userID === undefined || videoID === undefined) {
    res.status(400).send("Invalid Parameters");
  } else {
    try {
      // Request video delete from user list
      const data = await deleteVideo(userID, videoID, pool);
      res.status(200).send(await data.rows);
    } catch (error) {
      console.log("Failed to delete video: " + error);
      res.status(400).send(error.message);
    }
  }
});

/**
 * Else 404
 */
app.all("*", async (request, response) => {
  response.status(404).send(`Not found: ${request.path}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
