// Regex expression to find collab videos
const name_pattern = new RegExp(/(?:^|\s)@[\w]{2,20}(\s|$)/);

import { stat } from "fs";
import { get } from "http";
import { stringify } from "querystring";
const URL = "";

const ID = "dh3vd39f3687o1iwjcqpy135fb2vwe";
const SECRET = "y1sfia19u6c88aqlkedhl1er86ylpt";
let access_token;

async function getStreamerId(name) {
  const response = await fetch(
    "https://api.twitch.tv/helix/users?login=" + name,
    {
      method: "get",
      headers: {
        Authorization: "Bearer " + access_token,
        "Client-Id": ID,
      },
    }
  );
  console.log(response.status);
  if (response.status !== 200) {
    getCredentials();
    throw new Error("Failed to get Steamer ID from Twitch. Please try again.");
  }
  return response;
}

/**
 * First gets the user id using their name, then uses
 * the id to get a list of videos. Limit of the first 40 videos
 *  * See: https://dev.twitch.tv/docs/api/videos/ for the video object details
 * @param {*} name
 * @returns promise of list of up to 40 videos
 */
async function search(streamer_id) {
  const response = await fetch(
    "https://api.twitch.tv/helix/videos?first=40&user_id=" + streamer_id,
    {
      method: "get",
      headers: {
        Authorization: "Bearer " + access_token,
        "Client-Id": ID,
      },
    }
  );
  if (response.status !== 200) {
    throw new Error("Error getting videos from Twitch");
  }
  // Filter videos to only ones with an @name in the title
  const entires = await response.json();
  return entires.data.filter(element => name_pattern.test(element.title));
}

// Update the access token
async function getCredentials() {
  try {
    const data = {
      client_id: ID,
      client_secret: SECRET,
      grant_type: "client_credentials",
    };
    const encodedData = stringify(data);
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodedData,
    });
    if (response.status === 400 || response.status === 401) {
      throw new Error(response.status);
    }
    const code = await response.json();
    access_token = code.access_token;
  } catch (error) {
    console.log("Error getting credentials: " + error);
  }
}

getCredentials();

export { search, getCredentials, getStreamerId };
