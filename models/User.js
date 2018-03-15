const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
	googleId: String,
	accessToken: String,
	refreshToken: String,
	profile: Object,
	credits: { type: Number, default: 0 }
});

mongoose.model("users", userSchema);
