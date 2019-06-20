const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");
const axios = require("axios");
const google = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const mongoose = require("mongoose");
const Video = mongoose.model("videos");

// const YOUTUBE_API_KEY = "AIzaSyDQ_kgowJCa-mH5wnjnQ1mOE4nBqQIGij8";
const YOUTUBE_API_KEY = "AIzaSyBB3-2_SzXX_N_I_udW_o2PUzfS07hpZl8"

module.exports = app => {

	app.post("/video_captions", async (req, res) => {
		const search = await axios.get(
			`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${
				req.body.videoId
			}&key=${YOUTUBE_API_KEY}`
		);


		var oauth2Client = new OAuth2(keys.clientID, keys.googleClientSecret);

		oauth2Client.credentials = {
			access_token: "ya29.GluRBY2BEKaVsjunZ-mIlUgPXbUcTzgAj5l2rhBbi9Nnq9nAMpA8rJbjGU7Np64UZ9vKA3WXuN-25EBARvk4QYmdtyPukvJwPzS_ie18CUazEbp_IMcaRWq_9I2B",
		};

		google
			.youtube({
				version: "v3",
				auth: oauth2Client
			})
			.captions.download(
				{
					id: "df9lgMeID9gWZmTHYtCuK-1YdMAxF7Eu",
					headers: {}
				},
				function(err, data, response) {
					if (err) {
						console.error("Error: " + err);
						res.json({
							status: "error",
							err: err,
							data: response
						});
					}
					if (data) {
						console.log(data);
						res.json({
							status: "ok",
							data: data
						});
					}
					if (response) {
						console.log(response);
						console.log("Status code: " + response.statusCode);
					}
				}
			);




		// google
		// 	.youtube({
		// 		version: "v3",
		// 		auth: oauth2Client
		// 	})
		// 	.captions.list(
		// 		{
		// 			part: "snippet",
		// 			videoId: req.body.videoId
		// 		},
		// 		function(err, data, response) {
		// 			if (err) {
		// 				console.error("Error: " + err);
		// 				res.json({
		// 					status: "error",
		// 					error: err
		// 				});
		// 			}
		// 			if (data) {
		// 				console.log(data.data);

						//
						// google
						// 	.youtube({
						// 		version: "v3",
						// 		auth: oauth2Client
						// 	})
						// 	.captions.download(
						// 		{
						// 			part: "snippet",
						// 			videoId: req.body.videoId,
						// 			headers: {}
						// 		},
						// 		function(err, data, response) {
						// 			if (err) {
						// 				console.error("Error: " + err);
						// 				res.json({
						// 					status: "error"
						// 				});
						// 			}
						// 			if (data) {
						// 				console.log(data);
						// 				res.json({
						// 					status: "ok",
						// 					data: data
						// 				});
						// 			}
						// 			if (response) {
						// 				console.log(response);
						// 				console.log("Status code: " + response.statusCode);
						// 			}
						// 		}
						// 	);
					// }
			// 		if (response) {
			// 			console.log(response);
			// 			console.log("Status code: " + response.statusCode);
			// 		}
			// 	}
			// );
	});


	app.post("/youtube_video_details", requireLogin, async (req, res) => {
		Video.findOne(
			{
				googleId: req.body.googleId
			},
			async (err, video) => {
				if(err) {
					console.log(err)
				}
				if (video) {
					res.json({
						newVideo: false,
						videoDetails: video
					});
				} else {
					const searchReq = await axios.get(
						`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${
							req.body.googleId
						}&key=${YOUTUBE_API_KEY}`
					);

					res.json({
						newVideo: true,
						videoDetails: {
							googleId: searchReq.data.items[0].id,
							snippet: searchReq.data.items[0].snippet,
							contentDetails: searchReq.data.items[0].contentDetails
						}
					});
				}
			}
		);
	});

	app.post("/youtube_video_add", requireLogin, async (req, res) => {
		Video.findOne(
			{ googleId: req.body.googleId },
			"googleId",
			async (err, video) => {
				if (video) {
					res.json(video);
				} else {
					const video = await new Video({
						googleId: req.body.googleId,
						snippet: req.body.snippet,
						contentDetails: req.body.contentDetails
					}).save();
					res.json(video);
				}
			}
		);
	});

	app.post("/hypedna_video_details", async (req, res) => {
		Video.findOne({ googleId: req.body.googleId }, async (err, video) => {
			if (video) {
				res.json(video);
			}
		});
	});

	app.post("/video_delete", async (req, res) => {
		Video.remove({ googleId: req.body.googleId }, async (err, video) => {
			if (err) return res.send(err);
			res.json({
				message: `deleted  video`
			});
		});
	});

	app.post("/video_track_add", requireLogin, async (req, res) => {
		const track = {
			references: req.body.track.references,
			createdBy: req.user._id,
			createdAt: new Date(),
			status: "draft",
			title: req.body.track.title
		};
		Video.update(
			{
				googleId: req.body.googleId
			},
			{
				$push: { tracks: track }
			},
			async (err, video) => {
				if (video) {
					res.json(video);
				}
			}
		);
	});

	app.post("/video_track_delete", requireLogin, async (req, res) => {
		Video.update(
			{
				googleId: req.body.googleId
			},
			{
				$pull: { tracks: { _id: req.body.trackId } }
			},
			async (err, video) => {
				if (video) {
					res.json(video);
				}
			}
		);
	});

	app.post("/video_track_update", async (req, res) => {
		Video.update(
			{
				googleId: req.body.googleId,
				tracks: { $elemMatch: { _id: req.body.trackId } }
			},
			{
				$set: { "tracks.$": req.body.newTrack }
			},
			async (err, video) => {
				if (video) {
					res.json(video);
				}
			}
		);
	});

	app.post("/video_track_clips_update", requireLogin, async (req, res) => {
		Video.update(
			{
				googleId: req.body.googleId,
				tracks: { $elemMatch: { _id: req.body.trackId } }
			},
			{
				$set: { "tracks.$.clips": req.body.clips }
			},
			async (err, video) => {
				if (video) {
					res.json(video);
				} else if (err) {
					res.send(err);
				}
			}
		);
	});

	app.post("/get_single_video_track", async (req, res) => {
		Video.findOne(
			{
				googleId: req.body.googleId
			},
			{ tracks: { $elemMatch: { _id: req.body.trackId } } },
			async (err, video) => {
				if (video) {
					res.json(video.tracks[0]);
				} else if (err) {
					res.send(err);
				}
			}
		);
	});

	app.post("/get_all_video_tracks", async (req, res) => {
		Video.findOne(
			{
				googleId: req.body.googleId
			},
			"tracks",
			async (err, video) => {
				if (video) {
					res.json(video);
				}
			}
		);
	});
};
