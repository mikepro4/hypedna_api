const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");
const axios = require("axios");

const mongoose = require("mongoose");
const Video = mongoose.model("videos");

const YOUTUBE_API_KEY = "AIzaSyDQ_kgowJCa-mH5wnjnQ1mOE4nBqQIGij8";

module.exports = app => {
	app.post("/youtube_video_details", requireLogin, async (req, res) => {
		const test = await axios.get(
			`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${
				req.body.url
			}&key=${YOUTUBE_API_KEY}`
		);

		res.json(test.data);
	});

	app.post("/youtube_video_add", requireLogin, async (req, res) => {
		const video = await new Video({
			videoId: req.body.url
		}).save();
		res.json(video);
	});
};
