# Email Tracking Server
This project implements a server that issues tracking pixels that can be embedded in emails. When the email is opened, the server will log various information about the recipient. The server also logs whenever the email is reopened.
The server also implements a rudimentary user registration and login system.

## Setup
```
npm install
node index.js
```

## Usage
The service is easiest to test using an API development environment like Postman.

### Registering a new user
Send a POST message to http://localhost:8000/register with two attributes in the body:
email: testEmail@test.com
password: testPassword

### Logging in
Send a POST message to http://localhost:8000/login with the same two attributes:
email: testEmail@test.com
password: testPassword
The server will then return an authentication token in it's response.

### Getting a tracking pixel URL
Send a POST message to http://localhost:8000/createUrl with one attribute:
email: recipientEmail@test.com
In the HEADER of the post message, set the x-access-token to the authentication token that was returned in the login step.
The server should send back a URL to the tracking pixel.

When the URL is opened, information about the recipient should be logged in the server's console.
