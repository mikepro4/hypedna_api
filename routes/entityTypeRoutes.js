const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");
const axios = require("axios");
const _ = require("lodash");

const mongoose = require("mongoose");
const EntityType = mongoose.model("entityTypes");
const Entity = mongoose.model("entity");

module.exports = app => {
	app.post("/entity_type_add", requireLogin, async (req, res) => {
		const entityType = await new EntityType({
			genericProperties: req.body.genericProperties,
			customProperties: req.body.customProperties,
			parentEntityTypes: req.body.parentEntityTypes
		}).save();
		if (req.body.parentEntityTypes[0]) {
			EntityType.update(
				{
					_id: req.body.parentEntityTypes[0].entityTypeId
				},
				{
					$push: {
						childEntityTypes: {
							entityTypeId: entityType._id
						}
					}
				},
				async (err, result) => {
					if (result) {
						res.json(entityType);
					} else if (err) {
						res.send(err);
					}
				}
			);
		} else {
			res.json(entityType);
		}
	});

	app.post("/load_all_entity_types", async (req, res) => {
		EntityType.find({}, async (err, entityTypes) => {
			if (entityTypes) {
				res.json(entityTypes);
			}
		});
	});

	app.post("/entity_type_update", requireLogin, async (req, res) => {
		EntityType.update(
			{
				_id: req.body.id
			},
			{
				$set: req.body.newEntityType
			},
			async (err, entityType) => {
				if (entityType) {
					res.json(entityType);
				}
			}
		);
	});

	app.post("/add_parent_entity_type", requireLogin, async (req, res) => {
		EntityType.update(
			{
				_id: req.body.id
			},
			{
				$push: {
					parentEntityTypes: {
						entityTypeId: req.body.newParentEntityTypeId
					}
				}
			},
			async (err, result) => {
				if (result) {
					EntityType.update(
						{
							_id: req.body.newParentEntityTypeId
						},
						{
							$push: {
								childEntityTypes: {
									entityTypeId: req.body.id
								}
							}
						},
						async (err, result) => {
							if (result) {
								res.json(result);
							} else if (err) {
								res.send(err);
							}
						}
					);
				}
			}
		);
	});

	app.post("/remove_parent_entity_type", requireLogin, async (req, res) => {
		EntityType.update(
			{
				_id: req.body.id
			},
			{
				$pull: {
					parentEntityTypes: {
						entityTypeId: req.body.removeParentEntityTypeId
					}
				}
			},
			async (err, result) => {
				if (result) {
					EntityType.update(
						{
							_id: req.body.removeParentEntityTypeId
						},
						{
							$pull: {
								childEntityTypes: {
									entityTypeId: req.body.id
								}
							}
						},
						async (err, result) => {
							if (result) {
								res.json(result);
							} else if (err) {
								res.send(err);
							}
						}
					);
				}
			}
		);
	});

	app.post("/add_custom_property", requireLogin, async (req, res) => {
		EntityType.update(
			{
				_id: req.body.id
			},
			{
				$push: {
					customProperties: req.body.customProperty
				}
			},
			async (err, result) => {
				if (result) {
					res.json(result);
				}
			}
		);
	});

	app.post("/update_custom_property", async (req, res) => {
		EntityType.update(
			{
				_id: req.body.id,
				customProperties: { $elemMatch: { _id: req.body.propertyId } }
			},
			{
				$set: { "customProperties.$": req.body.newValues }
			},
			async (err, result) => {
				if (result) {
					let originalPropertyName = _.filter(
						req.body.originalCustomProperties,
						property => {
							return property._id == req.body.propertyId;
						}
					);
					let original = originalPropertyName[0].propertyName;

					Entity.updateMany(
						{
							associatedEntityTypes: {
								$elemMatch: { entityTypeId: req.body.id }
							}
						},
						{
							$rename: {
								["properties." + original]:
									"properties." + req.body.newValues.propertyName
							}
						},
						async (err, result) => {
							res.json(result);
						}
					);
				} else if (err) {
					res.send(err);
				}
			}
		);
	});

	app.post("/update_all_custom_properties", async (req, res) => {
		console.log(req.body);
		EntityType.update(
			{
				_id: req.body.id
			},
			{
				$set: { customProperties: req.body.customProperties }
			},
			async (err, result) => {
				if (result) {
					res.json(result);
				} else if (err) {
					res.send(err);
				}
			}
		);
	});

	app.post("/remove_custom_property", requireLogin, async (req, res) => {
		EntityType.update(
			{
				_id: req.body.id
			},
			{
				$pull: {
					customProperties: { _id: req.body.propertyId }
				}
			},
			async (err, result) => {
				if (result) {
					res.json(result);
				}
			}
		);
	});

	app.post("/get_single_entity_type", async (req, res) => {
		EntityType.findOne(
			{
				_id: req.body.id
			},
			async (err, entityType) => {
				if (entityType) {
					res.json(entityType);
				} else if (err) {
					res.send(err);
				}
			}
		);
	});

	app.post("/entity_type_delete", async (req, res) => {
		EntityType.remove({ _id: req.body.id }, async (err, video) => {
			if (err) return res.send(err);
			EntityType.updateMany(
				{
					parentEntityTypes: {
						$all: [{ $elemMatch: { entityTypeId: req.body.id } }]
					}
				},
				{
					$pull: { parentEntityTypes: { entityTypeId: req.body.id } }
				},
				async (err, info) => {
					if (err) return res.send(err);

					EntityType.updateMany(
						{
							childEntityTypes: {
								$all: [{ $elemMatch: { entityTypeId: req.body.id } }]
							}
						},
						{
							$pull: { childEntityTypes: { entityTypeId: req.body.id } }
						},
						async (err, info) => {
							if (err) return res.send(err);
							res.json({
								message: `deleted  and updated`,
								info: info
							});
						}
					);
				}
			);
		});
	});
};
