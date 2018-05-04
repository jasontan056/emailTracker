let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let config = require('./config');
let model = require('./model');

// Registers a new user. Takes an email and password.
exports.register = function(req, res) {
  // !!! real version would need to check these inputs.
  let email = req.body.email;
  let hashedPassword = bcrypt.hashSync(req.body.password, 8);
  model.findUser(req.body.email, (user) => {
    if (user) {
      return res.status(500).send("User already exists.");
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
  // !!! real version would need to check these inputs.
  model.findUser(req.body.email, (user) => {
    if (!user) {
      return res.status(404).send('No user found.');
    }

    var passwordIsValid = bcrypt.compareSync(
      req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null });
    }

    var token = jwt.sign({id: user.userId}, config.SECRET, {
        expiresIn: 86400 // expires in 24 hours
      });
    res.status(200).send({ auth: true, token: token });
  });
};

// Middleware that verifies JWT token.
exports.verifyToken = function(req, res, next) {
  let token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, config.SECRET, function(err, decoded) {
    if (err) {
      return res.status(500).send(
        { auth: false, message: 'Failed to authenticate token.' });
      }
    // Put the decoded userId into the request for later functions.
    req.userId = decoded.id;
    next();
  });
};
