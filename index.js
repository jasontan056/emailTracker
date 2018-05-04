'use strict';

let express = require('express')
let app = express()

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let cookieParser = require('cookie-parser');
app.use(cookieParser());
let tracking = require('./tracking');
let auth = require('./auth');

app.post('/register', auth.register);
app.post('/login', auth.login);

app.post('/createUrl', auth.verifyToken,tracking.createUrl);
app.get('/pixel', tracking.getPixel);

app.listen(8000, function () {
  console.log('Listening on port 8000!')
})
