const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = require("./User");
const ClipSchema = require("./Clip");
const EntitySchema = require("./Entity");

const trackSchema = new Schema({
	clips: [ClipSchema],
	metadata: {
		createdBy: String,
		createdAt: Date,
		customOfInfo: {
			title: String,
			description: String,
			imageUrl: String
		},
		video: {
			videoId: String,
			channelId: String,
			channelTitle: String,
			thumbnails: []
		},
		published: { type: Boolean, default: false },
		approved: { type: Boolean, default: false },
		version: { type: Number, default: 0 }
	},
	statistics: {
		length: { type: Number, default: 0 },
		views: { type: Number, default: 0 },
		likes: { type: Number, default: 0 },
		dislikes: { type: Number, default: 0 }
	},
	references: {
		rootEntityType: String,
		ofRefs: {
			entityTypeIds: [],
			entity: {
				displayName: String,
				id: String,
				imageUrl: String
			}
		},
		byRefs: {
			entityTypeIds: [],
			entity: {
				displayName: String,
				id: String,
				imageUrl: String
			}
		}
	}
});

mongoose.model("tracks", trackSchema);

module.exports = trackSchema;
