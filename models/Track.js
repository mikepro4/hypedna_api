const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = require("./User");
const ClipSchema = require("./Clip");
const EntitySchema = require("./Entity");

const trackSchema = new Schema({
	entity: EntitySchema,
	category: String,
	contributors: [String],
	createdBy: String,
	createdAt: Date,
	status: String,
	clips: [ClipSchema]
});

module.exports = trackSchema;
