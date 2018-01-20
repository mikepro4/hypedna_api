const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");
const axios = require("axios");

const mongoose = require("mongoose");
const EntityType = mongoose.model("entityTypes");

module.exports = app => {
	app.post("/entity_type_add", requireLogin, async (req, res) => {
		const entityType = await new EntityType({
			genericProperties: req.body.genericProperties,
			customProperties: req.body.customProperties,
			parentEntityTypes: req.body.parentEntityTypes
		}).save();
		res.json(entityType);
	});

	app.post("/load_all_entity_types", requireLogin, async (req, res) => {
		EntityType.find({}, async (err, entityTypes) => {
			if (entityTypes) {
				res.json(entityTypes);
			}
		});
	});
};
