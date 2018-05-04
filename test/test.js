let expect = require('chai').expect;
let myApp = require('../index.js');
let request = require('supertest')(myApp.app);

describe('POST /register', function() {
    it('success if valid registration', function(done) {
        request
            .post('/register')
            .send({email: "test1@gmail.com", password: "pass1"})
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('success registering second user', function(done) {
        request
            .post('/register')
            .send({email: "test2@gmail.com", password: "pass2"})
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('500 error if registering a duplicate user', function(done) {
        request
            .post('/register')
            .send({email: "test1@gmail.com", password: "pass1"})
            .expect(500, done);
    });
});

describe('POST /login', function() {
    it('successful login for user 1', function(done) {
        request
            .post('/login')
            .send({email: "test1@gmail.com", password: "pass1"})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              expect(res.body.token).to.not.equal(null);
              expect(res.body.auth).to.be.true;
              done();
            });
    });

    it('no jwt token for when password is incorrect', function(done) {
        request
            .post('/login')
            .send({email: "test1@gmail.com", password: "wrong"})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              expect(res.body.token).to.equal(null);
              expect(res.body.auth).to.be.false;
              done();
            });
    });

    it('Unsucessful login for unknown user', function(done) {
        request
            .post('/login')
            .send({email: "unknown@gmail.com", password: "pass2"})
            .expect(404, done);
    });
});

describe('POST /createUrl', function() {
    let loginToken;

    before(function(done){
      request
          .post('/login')
          .send({email: "test1@gmail.com", password: "pass1"})
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            loginToken = res.body.token;
            done();
          });
    });

    it('should respond with 403 if no access token is provided',
      function(done) {
        request
            .post('/createUrl')
            .send({email: "recip1@gmail.com"})
            .expect('Content-Type', /json/)
            .expect(403, done);
    });

    it('should respond with 500 if access token is invalid',
      function(done) {
        request
            .post('/createUrl')
            .set({'x-access-token': 'asdfasdf'})
            .send({email: "recip1@gmail.com"})
            .expect('Content-Type', /json/)
            .expect(500, done);
    });

    it('should respond with url if email and token are provided',
      function(done) {
        request
            .post('/createUrl')
            .set({'x-access-token': loginToken})
            .send({email: "recip1@gmail.com"})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              expect(res.body.url).to.be.equal(
                'http://localhost:8000/pixel?uid=1&rid=1');
              done();
            });
    });

    it('same url should be provided if same email is used again.',
      function(done) {
        request
            .post('/createUrl')
            .set({'x-access-token': loginToken})
            .send({email: "recip1@gmail.com"})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              expect(res.body.url).to.be.equal(
                'http://localhost:8000/pixel?uid=1&rid=1');
              done();
            });
    });

    it('new receiver id for new email',
      function(done) {
        request
            .post('/createUrl')
            .set({'x-access-token': loginToken})
            .send({email: "recip2@gmail.com"})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              expect(res.body.url).to.be.equal(
                'http://localhost:8000/pixel?uid=1&rid=2');
              done();
            });
    });
});

describe('POST /pixel', function() {
    it('send a pixel and cookie', function(done) {
        request
            .get('/pixel?uid=1&rid=1')
            .expect('Content-Type', 'image/png')
            .expect(200, done);
    });
});
