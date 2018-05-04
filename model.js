let redis = require('redis-mock'),
redisClient = redis.createClient();

class User {
  constructor(userId, password, email) {
    this.userId = userId;
    this.password = password;
    this.email = email;
  }
};

class Recipient {
  constructor(rEmail, userId) {
    this.rEmail = rEmail;
    this.userId = userId;
    this.timestamp = 0;
    this.ip = 0;
    this.deviceId = 0;
  }
};

// !!! remove once user registration is added.
/*redisClient.hmset("userEmail:hello@precognitive.io",
  new User(123, 567, "hello@precognitive.io"));
redisClient.set("userId:123", "hello@precognitive.io");*/

exports.findUserEmail = function(userId, callback) {
  redisClient.get("userId:" + userId, (err, user) => {
    console.log("in finduser");
    console.log(user);
    callback(user);
  });
};

exports.createUser = function(userEmail, hashedPassword, callback) {
  redisClient.incr('userId', (err, userId) => {
    redisClient.hmset("userEmail:" + userEmail,
      new User(userId, hashedPassword, userEmail),
      (err, user) => {
        redisClient.set("userId:" + user.userId, userEmail);
        callback(user);
      });
  });
}

exports.findUser = function(userEmail, callback) {
  redisClient.hgetall("userEmail:" + userEmail, (err, user) => {
    callback(user);
  });
};

exports.createNewDeviceId = function(callback) {
  redisClient.incr('deviceId', (err, deviceId) => {
    callback(deviceId);
  });
}

exports.createRecipientId = function(userId, rEmail, callback) {
  redisClient.get("userId:" + userId + "/rEmail:" + rEmail,
    (err, rid) => {
      // Return if we already have created an rid for this recipient.
      if (rid) {
        callback(rid);
        return;
      }

      // Create a new rid and create the recipient.
      redisClient.incr('rid', (err, newRid) => {
        redisClient.set("userId:" + userId + "/rEmail:" + rEmail, newRid,
          (err, res) => {
            redisClient.hmset("rid:" + newRid, new Recipient(rEmail, userId),
              (err, recipient) => {
                callback(newRid);
              });
          });
      });
    });
};

exports.findRecipient = function(rid, callback) {
  console.log('in find recipient');
  redisClient.hgetall("rid:" + rid, (err, recipient) => {
    if (recipient) {
      console.log('in find recipient. found recipient.');
      callback(recipient);
    } else {
      console.log('in find recipient. couldnt find recipient.');
      callback(null);
    }
  });
};

exports.updateRecipient = function(rid, recipient) {
  console.log('in create recipient');

  redisClient.hmset("rid:" + rid, recipient, (err, recipient) => {
        console.log('in create recipient. created recipient');
      });
};
