const mongoose = require("mongoose");
const { Schema } = mongoose;
const propertySchema = require("./Property");

const entitySchema = new Schema({
	genericProperties: {
		type: String,
		displayName: String,
		createdAt: Date,
		createdBy: String,
		imgUrl: String,
		description: String
	},
	customProperties: [propertySchema],
	associatedEntityTypes: [
		{
			entityTypeId: String
		}
	]
});

module.exports = entitySchema;
