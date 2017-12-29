const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoSchema = new Schema({
	videoId: String
});

mongoose.model("videos", videoSchema);
