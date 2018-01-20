const mongoose = require("mongoose");
const { Schema } = mongoose;

const PropertySchema = new Schema({
	type: String,
	defaultValue: String,
	propertyName: String,
	value: String,
	label: String,
	description: String
});

module.exports = PropertySchema;
