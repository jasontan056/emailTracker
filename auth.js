let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let config = require('./config');
let model = require('./model');

// Registers a new user. Takes an email and password.
exports.register = function(req, res) {
  // !!! add check to check format for email.
  let email = req.body.email;
  let hashedPassword = bcrypt.hashSync(req.body.password, 8);
  model.findUser(req.body.email, (user) => {
    if (user) {
      res.status(500).send("User already exists.");
    }

    model.createUser(email, hashedPassword, (user) => {
      // Create signed token
      let token = jwt.sign({id: user.userId}, config.SECRET,
        {expiresIn: 86400 // expires in 24 hours
      });

      res.status(200).send({auth: true, token: token});
    });
  });
};

// Logins a user. Sends back a signed JWT token if credentials are correct.
exports.login = function(req, res) {
};

// Middleware that verifies JWT token.
exports.verifyToken = function(req, res, next) {
  req.userId = 123;
  next();
};
