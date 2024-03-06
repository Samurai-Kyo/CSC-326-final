// Display values
const video_container = document.getElementById("video-container");
const video_header = document.getElementById("video-header");

// Regex expression to find all names in a video title
const all_names = new RegExp(/@(\w{1,19})\b/g);

/**
 * Calls search with the streamer name
 * Renders the retrieved videos in the video container
 * @param string name
 * @returns Returns a list of videos if videos were found, otherwise []
 */
async function getVideos(name) {
  if (name === "") {
    video_container.innerHTML = "";
    video_header.innerHTML = "";
    video_header.style.display = "inline-block";
    video_header.innerText = "Input streamer name";
    return [];
  }

  video_container.innerHTML = "";
  video_header.innerHTML = "";
  video_header.style.display = "none";
  
  try {
    // Get videos
    const video_list = await search(name);
    // Display streamer Channel Page link
    video_header.style.display = "inline-block";
    video_header.innerHTML = `<a href='https://www.twitch.tv/${name}'>Channel Page: ${name}</a>`;
    return await video_list;
  } catch (error) {
    console.log("Failed to get videos: " + error);
    video_header.style.display = "inline-block";
    video_header.innerText = error;
    return [];
  }
}

/**
 * Take in a streamers name and return a list of videos
 * that they have collaborated in. Throws error if response is 400
 * @param string name
 * @returns promise of list of videos
 */
async function search(name) {
  const response = await fetch(`videos?name=${name}`);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json();
}

/**
 * Takes in a video object and renders it as a row in
 * the video container. Called by the search function
 * See: https://dev.twitch.tv/docs/api/videos/ for the video object details
 * @param {*} video
 * @returns the video row div
 */
function renderVideo(video) {
  const video_row = document.createElement("div");

  const video_title = document.createElement("a");
  video_title.classList.add("video-title");
  video_title.href = video.url;
  video_title.innerText = "Title: " + video.title;

  const video_date = document.createElement("div");
  video_date.classList.add("video-date");
  video_date.innerText = "Date: " + video.created_at.slice(0, 10);

  const video_duration = document.createElement("div");
  video_duration.classList.add("video-duration");
  video_duration.innerText = "Duration: " + video.duration;

  const video_views = document.createElement("div");
  video_views.classList.add("video-views");
  video_views.innerText = "Views: " + video.view_count;

  const video_thumbnail = document.createElement("a");
  video_thumbnail.classList.add("video-thumbnail");
  video_thumbnail.href = video.url;

  const video_thumbnail_img = document.createElement("img");
  const width = 320;
  const height = 180;
  video_thumbnail_img.src = video.thumbnail_url
    .replace("%{width}", width)
    .replace("%{height}", height);
  video_thumbnail.appendChild(video_thumbnail_img);

  const video_collaborations = document.createElement("div");
  video_collaborations.classList.add("video-collabs");
  video_collaborations.innerText =
    "Collaborator: " +
    (video.title.match(all_names) || []).join(", ").replace(/@/g, "");

  video_row.appendChild(video_title);
  video_row.appendChild(video_collaborations);
  video_row.appendChild(video_views);
  video_row.appendChild(video_date);
  video_row.appendChild(video_thumbnail);
  video_row.appendChild(video_duration);

  video_row.classList.add("container-row");
  document.getElementById("video-container").appendChild(video_row);

  return video_row;
}

export { getVideos, renderVideo };
