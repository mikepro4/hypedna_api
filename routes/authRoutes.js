const passport = require("passport");

module.exports = app => {
	app.get(
		"/auth/google",
		passport.authenticate("google", {
			scope: [
				"profile",
				"email",
				"https://www.googleapis.com/auth/youtube",
				"https://www.googleapis.com/auth/youtube.upload"
			],
			accessType: 'offline',
			approvalPrompt: 'force'
		})
	);

	app.get(
		"/auth/google/callback",
		passport.authenticate("google"),
		(req, res) => {
			res.redirect("/profile");
		}
	);

	app.get(
		"/api/auth/google/callback",
		passport.authenticate("google"),
		(req, res) => {
			res.redirect("/");
		}
	);

	app.get("/logout", (req, res) => {
		req.logout();
		res.redirect("/");
	});

	app.get("/current_user", (req, res) => {
		res.send(req.user);
	});
};
