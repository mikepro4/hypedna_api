const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoSchema = new Schema({
	googleId: String,
	snippet: Object,
	contentDetails: Object
});

mongoose.model("videos", videoSchema);
