// Registers a new user. Takes an email and password.
exports.register = function(req, res) {
};

// Logins a user. Sends back a signed JWT token if credentials are correct.
exports.login = function(req, res) {
};

// Middleware that verifies JWT token.
exports.verifyToken = function(req, res, next) {
  next();
};