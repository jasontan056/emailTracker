let model = require('./model');
let config = require('./config');


// Returns a trackable URL to a tracking pixel.
exports.createUrl = function(req, res) {
  console.log('Called createUrl from user %d for recipient email %s',
    req.userId, req.body.email);
  if (!req.body.email) {
    res.status(400).json({error: 'Missing email'});
  }

  model.createRecipient(req.userId,req.body.email, rid => {
    console.log('created rid %d', rid);
    let url = "https://" + config.HOST_NAME + "/pixel?uid=" + req.userId +
      "&rid=" + rid;
    res.status(200).json({url: url});
  });
};

// Logs the request for the pixel and sends back an actual pixel.
exports.getPixel = function(req, res) {
  console.log('Called getPixel.')
};
