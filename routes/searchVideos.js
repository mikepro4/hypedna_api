const mongoose = require("mongoose");
const Video = mongoose.model("videos");

module.exports = app => {
	app.post("/search/videos", async (req, res) => {
		const { criteria, sortProperty, offset, limit } = req.body;
		const query = Video.find(buildQuery(criteria))
			.sort({ [sortProperty]: -1 })
			.skip(offset)
			.limit(limit);

		return Promise.all([query, Video.find(buildQuery(criteria)).count()]).then(
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
};

const buildQuery = criteria => {
	const query = {};

	if (criteria.name) {
		query.$text = { $search: criteria.name };
	}

	if (criteria.age) {
		query.age = {
			$gte: criteria.age.min,
			$lte: criteria.age.max
		};
	}

	if (criteria.yearsActive) {
		query.yearsActive = {
			$gte: criteria.yearsActive.min,
			$lte: criteria.yearsActive.max
		};
	}

	return query;
};
