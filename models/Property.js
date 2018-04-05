const mongoose = require("mongoose");
const { Schema } = mongoose;

const PropertySchema = new Schema({
	created:  {type: Date, default: Date.now},
	fieldType: String,
	propertyName: String,
	defaultValue: String,
	displayName: String,
	propertyType: String,
	description: String,
	entityType: String,
	dropdownValues: [
		{
			valueDisplayName: String,
			valuePropertyName: String
		}
	]
});

module.exports = PropertySchema;
