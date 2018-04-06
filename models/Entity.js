const mongoose = require("mongoose");
const { Schema } = mongoose;
const propertySchema = require("./Property");

const entitySchema = new Schema({
	created:  {type: Date, default: Date.now},
	properties: Object,
	associatedEntityType: String,
	associatedEntityTypes: [
		{
			entityTypeId: String
		}
	]
});

entitySchema.index({
	"properties.displayName": "text",
});

entitySchema.index({
	"associatedEntityType": 1,
});

entitySchema.index({
	"properties.displayName": 1,
});

entitySchema.index({
	"created": 1,
});

entitySchema.index({
	"properties.entityUrlName": 1
});

entitySchema.index({
	"associatedEntityTypes.entityTypeId": 1
});

const Entity = mongoose.model("Entity", entitySchema);

Entity.ensureIndexes();
// Entity.on("index", function(err) {
// 	console.log(err);
// });

// Entity.collection.dropIndexes(function(err, results) {
// 	// Handle errors
// });

mongoose.model("entity", entitySchema);
