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

    if (recipient.timestamp == 0) {
      console.log("first open");
      recipient.timestamp = new Date();
      recipient.ip = req.ip;
      model.createNewDeviceId((deviceId) => {
        recipient.deviceId = deviceId;
        console.log(recipient);
        model.updateRecipient(rid, recipient);
        emailNotif(userId, recipient.rEmail, recipient.timestamp, recipient.ip,
          false, true);
        let dateInFuture = new Date(new Date().setFullYear(
          new Date().getFullYear() + 1));
        res.cookie('deviceId', deviceId, {expire: dateInFuture});

      });
    } else {
      console.log("repeat open");
      console.log(recipient);
      console.log(req.cookies);
      sameDevice = req.cookies.deviceId == recipient.deviceId;
      emailNotif(userId, recipient.rEmail, recipient.timestamp, recipient.ip,
        true, sameDevice);
    }
    res.status(200).sendFile(__dirname + '/pixel.png');
  });
}

function emailNotif(userId, rEmail, timestamp, ip, reopen, sameDevice) {
  model.findUserEmail(userId, (userEmail) => {
    console.log("Notification to: " + userEmail);
    console.log("Recipient " + rEmail + " has opened the email at time " +
      timestamp + " from IP " + ip);
    if (reopen) {
      if (sameDevice) {
        console.log("This is a reopen from the original device.")
      } else {
        console.log("This is a reopen from a new device.")
      }
    } else {
      console.log("This is the first time this email has been opened.")
    }
  });
}
