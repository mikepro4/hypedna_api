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
		canContainEntities: { type: Boolean, default: false },
		visible: { type: Boolean, default: false },
		refs: {
			root: { type: Boolean, default: false },
			hasByOfRefs: { type: Boolean, default: false },
			isRef: { type: Boolean, default: false },
			isByRef: { type: Boolean, default: false },
			isOfRef: { type: Boolean, default: false }
		}
	},
	customProperties: [propertySchema],
	parentEntityTypes: [
		{
			entityTypeId: String
		}
	],
	childEntityTypes: [
		{
			entityTypeId: String
		}
	]
});

mongoose.model("entityTypes", entityTypeSchema);