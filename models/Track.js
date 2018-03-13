const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = require("./User");
const ClipSchema = require("./Clip");
const EntitySchema = require("./Entity");

const trackSchema = new Schema({
	createdBy: String,
	createdAt: Date,
	status: String,
	clips: [ClipSchema],
	title: String,
	description: String,
	imageUrl: String,
	references: {
		rootEntityType: String,
		entityTypeIds: [],
		entity: {
			displayName: String,
			id: String,
			imageUrl: String
		}
	}
});

module.exports = trackSchema;
