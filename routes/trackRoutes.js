const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");
const axios = require("axios");
const _ = require("lodash");
const mongoose = require("mongoose");
const Track = mongoose.model("tracks");

module.exports = app => {
	app.post("/tracks/search", async (req, res) => {
		const { criteria, sortProperty, offset, limit } = req.body;
		const query = Track.find(buildQuery(criteria))
			.sort({ [sortProperty]: -1 })
			.skip(offset)
			.limit(limit);

		return Promise.all([query, Track.find(buildQuery(criteria)).count()]).then(
			results => {
				return res.json({
					all: results[0],
					count: results[1],
					offset: offset,
					limit: limit
				});
			}
		);
	});

	app.post("/tracks/add", requireLogin, async (req, res) => {
		let updateTrackMetadata = _.assign({}, req.body.track.metadata, {
			createdBy: req.user._id,
			createdAt: new Date()
		});

		let updatedTrack = _.assign({}, req.body.track, {
			metadata: updateTrackMetadata
		});
		const track = await new Track(updatedTrack).save();
		res.json(track);
	});

	app.post("/tracks/update", requireLogin, async (req, res) => {
		Track.update(
			{
				_id: req.body.trackId
			},
			{
				$set: req.body.newTrack
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Track.findOne({ _id: req.body.trackId }, async (err, track) => {
						if (track) {
							res.json({ success: "true", info: info, data: track });
						}
					});
				}
			}
		);
	});

	app.post("/tracks/update_clips", requireLogin, async (req, res) => {
		Track.update(
			{
				_id: req.body.trackId
			},
			{
				$set: { clips: req.body.clips }
			},
			async (err, info) => {
				if (err) res.status(400).send({ error: "true", error: err });
				if (info) {
					Track.findOne({ _id: req.body.trackId }, async (err, track) => {
						if (track) {
							res.json({ success: "true", info: info, data: track });
						}
					});
				}
			}
		);
	});

	app.post("/tracks/delete", requireLogin, async (req, res) => {
		Track.remove({ _id: req.body.trackId }, async (err, video) => {
			if (err) return res.send(err);
			res.json({
				success: "true",
				message: `deleted  video`
			});
		});
	});
};

const buildQuery = criteria => {
	const query = {};

	if (criteria.videoId) {
		_.assign(query, {
			"metadata.video.videoId": {
				$eq: criteria.videoId
			}
		});
	}

	if (criteria.ofEntityTypes) {
	}

	if (criteria.ofEntities) {
	}

	if (criteria.byEntityTypes) {
	}

	if (criteria.byEntities) {
	}
	return query;
};
