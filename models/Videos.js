const mongoose = require("mongoose");
const { Schema } = mongoose;
const TrackSchema = require("./Track");

const videoSchema = new Schema({
	googleId: String,
	snippet: Object,
	contentDetails: Object,
	created:  {type: Date, default: Date.now},
});

mongoose.model("videos", videoSchema);
