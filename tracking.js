let model = require('./model');
let config = require('./config');


// Returns a trackable URL to a tracking pixel.
exports.createUrl = function(req, res) {
  console.log('Called createUrl from user %d for recipient email %s',
    req.userId, req.body.email);
  if (!req.body.email) {
    res.status(400).json({error: 'Missing email'});
  }

  model.createRecipientId(req.userId,req.body.email, rid => {
    console.log('created rid %d', rid);
    let url = "http://" + config.HOST_NAME + "/pixel?uid=" + req.userId +
      "&rid=" + rid;
    res.status(200).json({url: url});
  });
};

// Logs the request for the pixel and sends back an actual pixel.
exports.getPixel = function(req, res) {
  if (!req.query.rid || !req.query.uid) {
    res.status(400).json({error: 'Missing parameters'});
  }
  let rid = req.query.rid;
  let userId = req.query.uid;
  console.log('Called getPixel with rid %d, userId, %d', rid, userId);

  model.findRecipient(rid, (recipient) => {
    if (!recipient) {
      console.log("couldnt find recipient");
      res.status(400);
      return;
    }

    console.log("found recipient");
    if (recipient.timestamp == 0) {
      console.log("first open");
      recipient.timestamp = new Date();
      recipient.ip = req.ip;
      model.updateRecipient(rid, recipient);
    } else {
      console.log("repeat open");
    }
  });
}
