const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = require("./User");
const EntitySchema = require("./Entity");

const clipSchema = new Schema({
	start: Number,
	end: Number,
	sentiment: String,
	createdAt: Date,
	createdBy: UserSchema,
	comment: String,
	entities: [EntitySchema]
});

module.exports = clipSchema;
