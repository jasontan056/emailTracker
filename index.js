'use strict';

var express = require('express')
var app = express()

var tracking = require('./tracking');
var auth = require('./auth');

app.post('/register', auth.register);
app.post('/login', auth.login);


// !!! remove userId once I have it in the JWT token
// !!! add auth middleware.
app.post('/:userId/createUrl', auth.verifyToken,tracking.createUrl);
app.get('/pixel', tracking.getPixel);

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})
