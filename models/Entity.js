const mongoose = require("mongoose");
const { Schema } = mongoose;
const propertySchema = require("./Property");

const entitySchema = new Schema({
	properties: Object,
	associatedEntityTypes: [
		{
			entityTypeId: String
		}
	]
});

entitySchema.index({ "properties.displayName": "text" });

const Entity = mongoose.model("Entity", entitySchema);

Entity.ensureIndexes();
// Entity.on("index", function(err) {
// 	console.log(err);
// });

// Entity.collection.dropIndexes(function(err, results) {
// 	// Handle errors
// });

mongoose.model("entity", entitySchema);
