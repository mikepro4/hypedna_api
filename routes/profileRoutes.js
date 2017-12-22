const google = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const requireLogin = require("../middlewares/requireLogin");
const keys = require("../config/keys");

module.exports = app => {
	app.get("/profile", requireLogin, function(req, res) {
		var oauth2Client = new OAuth2(keys.clientID, keys.googleClientSecret);

		oauth2Client.credentials = {
			access_token: req.user.accessToken,
			refresh_token: req.user.refreshToken
		};

		google
			.youtube({
				version: "v3",
				auth: oauth2Client
			})
			.subscriptions.list(
				{
					part: "snippet, contentDetails",
					mine: true,
					maxResults: 50,
					headers: {}
				},
				function(err, data, response) {
					if (err) {
						console.error("Error: " + err);
						res.json({
							status: "error"
						});
					}
					if (data) {
						console.log(data);
						res.json({
							status: "ok",
							data: data
						});
					}
					if (response) {
						console.log(response);
						console.log("Status code: " + response.statusCode);
					}
				}
			);
	});
};
