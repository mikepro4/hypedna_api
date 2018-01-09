const mongoose = require("mongoose");
const { Schema } = mongoose;
const TrackSchema = require("./Track");

const videoSchema = new Schema({
	googleId: String,
	snippet: Object,
	contentDetails: Object,
	tracks: [TrackSchema]
});

mongoose.model("videos", videoSchema);
