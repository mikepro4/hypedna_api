const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = require("./User");

const entitySchema = new Schema({
	type: String,
	displayName: String,
	createdAt: Date,
	createdBy: UserSchema
});

module.exports = entitySchema;
