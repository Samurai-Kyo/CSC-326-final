Outline:
This application allows for users of Twitch to search for Collaborative videos between Twitch creators. I made this application because twitch has historically offered near zero support for interactions between streamers, including between fellow Twitch streamers or streamers from other platforms such as YouTube. My application takes advantage of the standard streamers use of putting a link to their collaborators in their stream titles. This means that the Twitch API can be used to fetch video titles which would normally be clunky to view. By searching for names in said titles, a list of videos and collaborators can be displayed to the user.

Features:
The site allows users to enter a streamer name and retrieves a list of videos from Twitch that contain names of streamers in the titles. Any search that returns at least one video is cached and can be selected via dropdown included in the search bar. The returned videos are displayed simultaneously in a list, including links to each video, the names of collaborators, and details about the video such as when it happened and how long it is. Additionally, a link to the streamer’s homepage is displayed next to the search bar.
The user is assigned an id if they do not have one cached, which will be saved in the database. The user can switch their Id at any time, allowing them to view and share their content on separate devices. There is no user authentication in this application.
The user can generate a list of videos they have saved. This done be clicking a save video button that appears under each video, save the details of that video and that the user saved it in the database. The user can then click the view saved videos button to have a list of saved videos retrieved from the database and displayed to them. Videos can be removed from this list using the delete video button that appears under each video while viewing the saved video list.

Architecture:
The front end of this application is standalone HTML, JavaScript, and CSS. The CSS is custom made and does not rely on any third-party styles. The JavaScript focuses on event listeners for the buttons and generating video lists by injecting them into a div. The site caches user searches and the user ID in local storage. 
I found the CSS to be one of the most frustrating parts of the project. Mainly getting the video list to format right. Adding new things after making the CSS didn’t help either. I’m happy how it came out. It adjusts well when the size of the screen changes. Technically it could be used on mobile phones.
The front end files as split between the main file, which contain the event listeners and connects the other files. The twitch_CRUD file handles all fetch requests to the backend, that are sent to Twitch. This sends the searched steamers name and expects a list of videos back. Note that Twitch limits streamers to a month of videos, so the number returns will generally be less than 20.
Database_CRUD handles all calls to the database through the backend. This includes handling the user’s ID, as well as saving and deleting videos from the video list. Despite these being in separate files, they are sending all their requests to the same backend server.
The backend uses Mrogan, postgress, and express. Express handles all calls sent to Twitch and ElephantSQL. Twitch is connected to a registered user application by ID and secret. This returns an access token used to query their API. The database, ElephandSQL uses a similar process using a url that contains an ID and password. It was interesting to set up the security myself. I’ve never seen how applications deal with access tokens and authentication.
The Index file contains all routes used by the server, as well as its initiation. The calls to the database and Twitch are separated into their own files. 
Twitch_CRUD makes fetch request to Twitch using the access token and a streamer name. It expects a streamer ID back and then fetches a list of videos using said ID. Any error during this process or a return of 0 videos sends an error 400 to the front end with a custom error message. Figuring out how the Twitch API worked was a bit of a pain. I needed to convert a name into an id, then search with that id. Also having to registar an application with their site to use their API. Helped me learn how to read API documentation though.
ElephandSQL.js handles all the creation of prepared statements and communication with the database. Prepared statements are used to registar user IDs, create lists, and add/delete videos from a list. There is also a script at the beginning creating any tables that do not exist. Any error from the database sends an error 400 to the front end with a custom message.
The database, ElephantSQL, contains 3 tables. A table for users, used to contain a list of IDs. A table to contain the details of each video. A table that relates users to videos. Working out my own schema was a little challenging, but not a major issue. For details on the tables, see the prepared statements in ElephandSQL.js.

Setup:
Install node packages in package.json using “npm install”. The server is started using “npm run dev”, which runs a script that sets up the server. If the terminal shows the server is running on localhost:3000, then it’s working. Currently the server is connected to my Twitch App and database, which will run on any machine. To link the server to your own, register a Twitch application and change the ID/Secret values in twitch.js. To set up a new database, host a database, and replace the link in ElephantSQL.js with your own. None of this is required to run the application, as my default values are sufficient.
Endpoints:

Twitch – 
GET “/videos”: takes streamer name(string)  gets streamer ID(int)  returns list of videos(json)
POST "/credentials": sends id/secret to Twitch. Updates access key. No return.

ElephantSQL –
GET "/user/videos": send ID query to database  returns list of videos(json)
PUT "/user”: Send ID to database  return user
POST "/user/videos”: Save video to database  return video
DELETE "/user/videos": Remove video from database  return video
ALL "*": Catch any call to a route that does not exist  return 404 error
