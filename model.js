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
    this.rDeviceId = null;
    this.timestamp = null;
    this.ip = null;
  }
};

// !!! remove once user registration is added.
redisClient.hmset("userEmail:hello@precognitive.io",
  new User(123, 567, "hello@precognitive.io"));
redisClient.set("userId:123", "hello@precognitive.io");


exports.createRecipient = function(userId, rEmail, callback) {
  redisClient.get("userId:" + userId + "/rEmail:" + rEmail,
    (err, rid) => {
      // Return if we already have created an rid for this recipient.
      if (rid) {
        callback(rid);
      }
      // Create a new rid for this recipient.
      redisClient.incr('rid', function(err, newRid) {
        redisClient.hmset("userId:" + userId + "/rEmail:" + rEmail, newRid,
          (err, res) => { callback(newRid)});
      });
    });
};
