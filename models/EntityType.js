const mongoose = require("mongoose");
const { Schema } = mongoose;
const propertySchema = require("./Property");
const entitySchema = require("./Entity");

const entityTypeSchema = new Schema({
	genericProperties: {
		displayName: String,
		createdAt: Date,
		createdBy: String,
		imgUrl: String,
		description: String,
		topLevel: Boolean
	},
	customProperties: [propertySchema],
	parentEntityTypes: [
		{
			entityTypeId: String
		}
	]
});

mongoose.model("entityTypes", entityTypeSchema);
