const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");
const axios = require("axios");
const _ = require("lodash");
const mongoose = require("mongoose");
const Entity = mongoose.model("entity");
const Video = mongoose.model("videos");
const Track = mongoose.model("tracks");

module.exports = app => {
	app.post("/get_single_entity", async (req, res) => {
		const { id } = req.body;
		const entity = Entity.findOne({
			_id: { $eq: id }
		});

		return Promise.all([entity])
			.then(results => {
				return res.json(results[0]);
			})
			.catch(error => {
				throw { error: error };
			});
	});

	app.post("/entity_update", requireLogin, async (req, res) => {
		Entity.update(
			{
				_id: req.body.id
			},
			{
				$set: req.body.newEntity
			},
			async (err, result) => {
				if (result) {
					const entity = await Entity.findOne(
						{
							_id: req.body.id
						},
						(err, result) => {
							Track.updateMany(
								{
									"references.ofRefs.entity.id": req.body.id
								},
								{
									$set: {
										"references.ofRefs.entity": {
											id: result._id,
											displayName: result.properties.displayName,
											imageUrl: result.properties.imageUrl
										}
									}
								},
								async (err, result) => {}
							);

							Track.updateMany(
								{
									"references.byRefs.entity.id": req.body.id
								},
								{
									$set: {
										"references.byRefs.entity": {
											id: result._id,
											displayName: result.properties.displayName,
											imageUrl: result.properties.imageUrl
										}
									}
								},
								async (err, result) => {}
							);
							res.json(result);
						}
					);
				}
			}
		);
	});

	app.post("/entity_load", async (req, res) => {
		const { entityUrlName } = req.body;
		const entity = Entity.findOne({
			"properties.entityUrlName": { $eq: entityUrlName }
		});

		return Promise.all([entity])
			.then(results => {
				return res.json(results[0]);
			})
			.catch(error => {
				throw { error: error };
			});
	});

	app.post("/validate_entity_url_name", requireLogin, async (req, res) => {
		const { entityUrlName } = req.body;
		return Entity.find(
			{
				"properties.entityUrlName": { $eq: entityUrlName }
			},
			async (err, result) => {
				if (!_.isEmpty(result)) return res.status(500).send("Already exists");
				res.json({ status: "ok" });
			}
		);
	});

	app.post("/entity_delete", async (req, res) => {
		Entity.remove({ _id: req.body.id }, async (err, entity) => {
			if (err) return res.send(err);
			res.json({
				message: `deleted`,
				info: entity
			});
		});
	});

	app.post("/create_entity", async (req, res) => {
		const entity = await new Entity({
			properties: req.body.properties,
			associatedEntityTypes: req.body.associatedEntityTypes
		}).save();
		res.json(entity);
	});

	app.post("/create_many_entities", async (req, res) => {
		Entity.insertMany(req.body.entities,
			async (err, result) => {
				if (err) return res.json({error: "true", info: err});
				res.json({
					success:"true",
					info: result
				})
			}
		)
	});

	app.post("/search/entities", async (req, res) => {
		const { criteria, sortProperty, offset, limit } = req.body;
		const query = Entity.find(buildSimpleQuery(criteria))
			.sort({ [sortProperty]: -1 })
			.skip(offset)
			.limit(limit);

		return Promise.all([
			query,
			Entity.find(buildSimpleQuery(criteria)).count()
		]).then(results => {
			return res.json({
				all: results[0],
				count: results[1],
				offset: offset,
				limit: limit
			});
		});
	});

	app.post("/search/entity_results", async (req, res) => {
		const {
			criteria,
			sortProperty,
			offset,
			limit,
			customProperties
		} = req.body;
		const query = Entity.find(buildComplexQuery(criteria, customProperties))
			.sort({ [sortProperty]: -1 })
			.skip(offset)
			.limit(limit);

		return Promise.all([
			query,
			Entity.find(buildComplexQuery(criteria, customProperties)).count()
		]).then(results => {
			return res.json({
				all: results[0],
				count: results[1],
				offset: offset,
				limit: limit
			});
		});
	});

	app.post("/search/get_property_stats", async (req, res) => {
		const { criteria, property, customProperties } = req.body;
		let propertyName = "$" + property;
		let test = "properties." + property;
		const query = Entity.aggregate(
			{
				$match: buildComplexQuery(criteria, customProperties)
			},
			{ $project: { ["properties." + property]: 1 } },
			{
				$group: {
					_id: "$properties." + property,
					count: { $sum: 1 }
				}
			}
		);

		return Promise.all([
			query,
			Entity.find(buildComplexQuery(criteria, customProperties)).count()
		]).then(results => {
			return res.json({
				all: results[0],
				count: results[1]
			});
		});
	});
};

const buildComplexQuery = (criteria, customProperties) => {
	const query = {};
	_.forOwn(criteria, (value, key) => {
		if (key !== "entityType") {
			let selectedOptions = [];
			let property = [];

			if (customProperties) {
				property = _.filter(customProperties, property => {
					return property.propertyName == key;
				});
				if (property[0]) {
					if (property[0].fieldType == "entitySelector") {
						selectedOptions = _.map(value, entity => {
							return entity.value;
						});
						let keyName = "properties." + key;

						if (selectedOptions.length > 0) {
							_.assign(query, {
								[keyName]: {
									$in: selectedOptions
								}
							});
						}
					} else if (property[0].fieldType == "input") {
						if (property[0].propertyType == "string") {
							selectedOptions = _.map(value, entity => {
								return entity.label;
							});
							let keyName = "properties." + key;

							if (selectedOptions.length > 0) {
								_.assign(query, {
									[keyName]: {
										$in: selectedOptions
									}
								});
							}
						} else if (
							property[0].propertyType == "date" ||
							property[0].propertyType == "number"
						) {
							let keyName = "properties." + key;
							if (criteria[key].from && !criteria[key].to) {
								_.assign(query, {
									[keyName]: {
										$gte: criteria[key].from
									}
								});
							} else if (criteria[key].to && !criteria[key].from) {
								_.assign(query, {
									[keyName]: {
										$lte: criteria[key].to
									}
								});
							} else if (criteria[key].from && criteria[key].to) {
								_.assign(query, {
									[keyName]: {
										$gte: criteria[key].from,
										$lte: criteria[key].to
									}
								});
							}
						}
					} else if (property[0].fieldType == "dropdown") {
						let selectedKeys = _.keys(_.pickBy(value, _.identity));

						let keyName = "properties." + key;
						if (selectedKeys.length > 0) {
							_.assign(query, {
								[keyName]: {
									$in: selectedKeys
								}
							});
						}
					} else if (property[0].fieldType == "checkbox") {
						let booleanOptions = [];

						let hasTrue = value.true == true;
						let hasFalse = value.false == true;

						if (hasTrue) {
							booleanOptions.push(true);
						}

						if (hasFalse) {
							booleanOptions.push(false);
						}

						if (hasTrue && hasFalse) {
							booleanOptions.push(true);
							booleanOptions.push(false);
						}

						let keyName = "properties." + key;
						if (booleanOptions.length > 0) {
							_.assign(query, {
								[keyName]: {
									$in: booleanOptions
								}
							});
						}
					}
				}
			} else {
				selectedOptions = _.map(value, entity => {
					return entity.label;
				});
				let keyName = "properties." + key;

				if (selectedOptions.length > 0) {
					_.assign(query, {
						[keyName]: {
							$in: selectedOptions
						}
					});
				}
			}
		}
	});

	let displayNames = _.map(criteria.displayName, entity => {
		return entity.label;
	});

	let entityUrlNames = _.map(criteria.entityUrlName, entity => {
		return entity.label;
	});

	if (displayNames.length > 0) {
		_.assign(query, {
			"properties.displayName": {
				$in: displayNames
			}
		});
	}

	if (entityUrlNames.length > 0) {
		_.assign(query, {
			"properties.entityUrlName": {
				$in: entityUrlNames
			}
		});
	}

	_.assign(query, {
		associatedEntityTypes: {
			$elemMatch: { entityTypeId: criteria.entityType }
		}
	});

	console.log(query);
	return query;
};

const buildSimpleQuery = criteria => {
	const query = {};

	if (criteria.displayName) {
		_.assign(query, {
			"properties.displayName": {
				$regex: new RegExp(criteria.displayName),
				$options: "i"
			}
		});
	}

	if (criteria.entityType) {
		_.assign(query, {
			associatedEntityTypes: {
				$elemMatch: { entityTypeId: criteria.entityType }
			}
		});
	}

	if (criteria.entityTypes) {
		_.assign(query, {
			associatedEntityTypes: {
				$elemMatch: { entityTypeId: { $in: criteria.entityTypes } }
			}
		});
	}

	return query;
};
