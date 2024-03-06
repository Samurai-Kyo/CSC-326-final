// Get all saved videos
async function getSavedVideos(UserID) {
  const response = await fetch(`user/videos?id=${UserID}`);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data;
}

/**
 * Create new user
 * @param {int} UserID
 * @returns true if successful otherwise false
 */
async function createUser(UserID) {
  const response = await fetch(`user?id=${UserID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.status === 200;
}

/**
 * Add video to user's video list
 * @param {int} UserID
 * @param {*} video
 */
async function saveVideo(UserID, video) {
  const response = await fetch(`user/videos?id=${UserID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },  
    body: JSON.stringify(video),
  });
  if (!response.ok) alert(await response.text());
}

/**
 * Delete video from user's video list
 * @param {int} UserID
 * @param {int} videoID
 * @returns true if successful otherwise false
 */
async function deleteVideo(UserID, videoID) {
  const response = await fetch(`user/videos?id=${UserID}&videoID=${videoID}`, {
    method: "DELETE",
  });
  return response.status === 200;
}

export { getSavedVideos, createUser, saveVideo, deleteVideo };
