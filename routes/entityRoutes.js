const keys = require("../config/keys");
const requireLogin = require("../middlewares/requireLogin");
const axios = require("axios");
const _ = require("lodash");
const mongoose = require("mongoose");
const Entity = mongoose.model("entity");

module.exports = app => {
	app.post("/entity_delete", async (req, res) => {
		Entity.remove({ _id: req.body.id }, async (err, entity) => {
			if (err) return res.send(err);
			res.json({
				message: `deleted`,
				info: entity
			});
		});
	});

	app.post("/create_entity", requireLogin, async (req, res) => {
		const entity = await new Entity({
			properties: req.body.properties,
			associatedEntityTypes: req.body.associatedEntityTypes
		}).save();
		res.json(entity);
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

	if (displayNames.length > 0) {
		_.assign(query, {
			"properties.displayName": {
				$in: displayNames
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

	return query;
};
