import * as twitch_CRUD from "./twitch_CRUD.js";
import * as database_CRUD from "./database_CRUD.js";

// Buttons
const get_videos_button = document.getElementById("get-videos-button");
const id_button = document.getElementById("id-button");
const search_button = document.getElementById("search-button");
const clear_button = document.getElementById("clear-button");

// User input
const user_id_field = document.getElementById("user-id-field");
const streamer_name = document.getElementById("streamer-name");
const search_history = document.getElementById("search-history");

// Display values
const user_id = document.getElementById("user-id");
const video_header = document.getElementById("video-header");
const video_container = document.getElementById("video-container");

// Initialize search history array
if (localStorage.getItem("searches") === null) {
  localStorage.setItem("searches", "[]");
}

// Initialize user ID
if (localStorage.getItem("id") === null) {
  localStorage.setItem("id", Math.floor(Math.random() * 100000000));
  database_CRUD.createUser(localStorage.getItem("id"));
}

user_id.innerText = "User ID:" + localStorage.getItem("id");

// Search for videos on Twitch by streamer name
function manageVideos() {
  const searches = JSON.parse(localStorage.getItem("searches"));
  const input = streamer_name.value;

  twitch_CRUD.getVideos(input).then((values) => {
    values.forEach((video) => {
      // Create Video Element
      const video_element = twitch_CRUD.renderVideo(video);

      // 'Favorite video' button
      const video_button = document.createElement("button");
      video_button.className = "favorite-button";
      video_button.innerText = "Favorite Video";
      video_button.addEventListener("click", () => {
        database_CRUD.saveVideo(localStorage.getItem("id"), video);
      });
      video_element.appendChild(video_button);
    });
    // Add to search history if new and at least one collab video was found
    if (values.length != 0 && !searches.includes(input)) {
      searches.push(input);
      localStorage.setItem("searches", JSON.stringify(searches));
    }
  });
}

// Search for videos (button)
search_button.addEventListener("click", () => {
  manageVideos();
});

// Search for videos (text field)
streamer_name.addEventListener("keyup", (event) => {
  let searches = JSON.parse(localStorage.getItem("searches"));
  let input = streamer_name.value;
  // Search
  if (event.key === "Enter") {
    manageVideos();
  }
  // Display search history as user types
  else if (searches && event.key !== "ArrowUp" && event.key !== "ArrowDown") {
    search_history.innerHTML = "";
    searches.forEach((element) => {
      if (
        element.substr(0, input.length).toUpperCase() == input.toUpperCase()
      ) {
        const new_option = document.createElement("option");
        new_option.innerText = element;
        search_history.appendChild(new_option);
      }
    });
  }
});

// Switch user ID
id_button.addEventListener("click", () => {
  localStorage.setItem("id", user_id_field.value);
  user_id.innerText = "User ID:" + localStorage.getItem("id");
  database_CRUD.createUser(localStorage.getItem("id"));
});

// Gets list of saved videos
get_videos_button.addEventListener("click", () => {
  video_header.style.display = "none";
  video_container.innerHTML = "";
  database_CRUD.getSavedVideos(localStorage.getItem("id")).then((values) => {
    values.forEach((video) => {
      const video_element = twitch_CRUD.renderVideo(video);

      // Delete video button!!!!
      const video_button = document.createElement("button");
      video_button.innerText = "Delete Video";
      video_button.className = "favorite-button";
      video_button.addEventListener("click", () => {
        if (database_CRUD.deleteVideo(localStorage.getItem("id"), video.id)) {
          video_element.remove();
        } else {
          alert("Failed to delete video");
        }
      });
      video_element.appendChild(video_button);
    });
  });
});

// Clear video list (button)
clear_button.addEventListener("click", () => {
  video_header.style.display = "none";
  video_container.innerHTML = "";
});
