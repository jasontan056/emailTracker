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

exports.findUserEmail = function(userId, callback) {
  redisClient.get("userId:" + userId, (err, userEmail) => {
    callback(userEmail);
  });
};

exports.createUser = function(userEmail, hashedPassword, callback) {
  redisClient.incr('userId', (err, userId) => {
    let newUser = new User(userId, hashedPassword, userEmail);
    redisClient.hmset("userEmail:" + userEmail, newUser, (err, res) => {
        redisClient.set("userId:" + userId, userEmail);
        callback(newUser);
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
  redisClient.hgetall("rid:" + rid, (err, recipient) => {
    if (recipient) {
      callback(recipient);
    } else {
      callback(null);
    }
  });
};

exports.updateRecipient = function(rid, recipient) {
  redisClient.hmset("rid:" + rid, recipient, (err, recipient) => {
      });
};
