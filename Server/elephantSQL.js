/**
 * Initialize database
 * @param {Pool} pool
 */
async function initializeDatabase(pool) {
  const query = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE);

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY UNIQUE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(255),
    created_at VARCHAR(255),
    view_count INT DEFAULT 0,
    thumbnail_url VARCHAR(255),
    url VARCHAR(255));

  CREATE TABLE IF NOT EXISTS users_videos (
    user_id INTEGER,
    video_id INTEGER,
    PRIMARY KEY (user_id, video_id));`;

  await pool.query(query, (error, result) => {
    if (error) {
      console.log("Database initiation failed: " + error);
    } else {
      console.log("Initialized database");
    }
  });
}

/**
 * Get all videos from user
 * @param {int} id
 * @param {Pool} pool
 * @returns {*} Promise
 */
async function getVideos(id, pool) {
  const query = `
  SELECT videos.*
  FROM videos
  JOIN users_videos ON videos.id = users_videos.video_id
  WHERE users_videos.user_id = '${id}';`;
  return await pool.query(query)
}

/**
 * Create new user
 * @param {int} id
 * @param {*} video
 * @param {Pool} pool
 * @returns {*} Promise
 */
async function newUser(id, pool) {
  const query = `
  INSERT INTO users (user_id)
  VALUES ('${id}')
  ON CONFLICT (user_id)
  DO NOTHING;`;

  return await pool.query(query);
}

/**
 * Add video to user's video list
 * @param {int} id
 * @param {*} video
 * @param {Pool} pool
 * @returns {*} Promise
 */
async function addVideo(id, video, pool) {
  const data_1 = [
    video.id,
    video.title,
    video.duration,
    video.created_at,
    video.view_count,
    video.thumbnail_url,
    video.url,
  ];
  const data_2 = [id, video.id];
  const query_1 =
    "INSERT INTO videos (id, title, duration, created_at, view_count, thumbnail_url, url)" +
    "SELECT $1, $2, $3, $4,$5, $6,$7 WHERE NOT EXISTS (SELECT 1 FROM videos WHERE id = $1);";
  const query_2 =
    "INSERT INTO users_videos (user_id, video_id)" +
    "VALUES ($1, $2)" +
    "ON CONFLICT (user_id, video_id)" +
    "DO NOTHING;";
  console.log(query_1);
  console.log(query_2);
  try {
    const results = [
      await pool.query(query_1, data_1),
      await pool.query(query_2, data_2),
    ];
    return results;
  } catch (error) {
    console.log("addVideo SQL error: " + error);
  }
}

/**
 * Delete video from user's video list
 * @param {int} id
 * @param {*} video
 * @param {Pool} pool
 * @returns {*} Promise
 */
async function deleteVideo(id, videoID, pool) {
  const query = `
  DELETE FROM users_videos
  WHERE user_id = '${id}'
  AND video_id = '${videoID}';`;
  console.log(query);
  return await pool.query(query);
}

export { initializeDatabase, getVideos, newUser, addVideo, deleteVideo };
