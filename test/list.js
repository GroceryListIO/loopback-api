'use strict';
process.env.NODE_ENV = 'test';

var assert = require('assert');
var app = require('../server/server');
var request = require('supertest')(app);

var user1 = {};
var user2 = {};
var user1List = '';

describe('Lists - Unauthenticated', function() {

  it('Initially 0 lists', function(done) {
    app.models.List.count({}, function(err, count) {
      assert.deepEqual(count, 0);
      done();
    });
  });

});

describe('Lists - Authenticated', function() {

  it('Register User1', function(done) {
    request
      .post('/api/users')
      .send({
        username: 'testuser1',
        email: 'testuser1@example.org',
        password: 'test',
      })
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then(function(response) {
        assert(response.body.email, 'testuser1@example.org');
        assert(response.body.username, 'testuser1');
        done();
      });
  });

  it('Login User1', function(done) {
    request
      .post('/api/users/login')
      .send({
        username: 'testuser1',
        password: 'test',
      })
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then(function(response) {
        assert(response.body.id);
        user1 = response.body;
        user1.token = user1.id;
        done();
      });
  });

  it('Create list as User1', function(done) {
    request
      .post('/api/users/' + user1.userId + '/lists/?access_token=' + user1.token)
      .send({
        name: 'test list 1',
        description: 'testing authenticated'
      })
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then(response => {
        assert(response.body.id);
        user1List = response.body.id;
        done();
      });
  });

  it('Get lists as User1', function(done) {
    request
    .get('/api/users/' + user1.userId + '/lists/?access_token=' + user1.token)
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .then(function(response) {
      assert(response.body.length, 1);
      done();
    });
  });

  it('Can\'t get lists as anonymous', function (done) {
    request
      .get('/api/users/' + user1.userId + '/lists/')
      .expect(401)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('Get single list as User1', function(done) {
    request
    .get('/api/users/' + user1.userId + '/lists/' + user1List + '/?access_token=' + user1.token)
    .expect(200)
    .expect('Content-Type', 'application/json; charset=utf-8')
    .then(response => {
      assert(response.body.id);
      done();
    });
  });

  it('Can\'t get single lists as anonymous', function (done) {
    request
      .get('/api/users/' + user1.userId + '/lists/' + user1List)
      .expect(401)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });

});

describe('Lists - Authenticated Multiuser', function() {

  it('Register User1', function (done) {
    request
      .post('/api/users')
      .send({
        username: 'testuser2',
        email: 'testuser12@example.org',
        password: 'test',
      })
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then(function (response) {
        assert(response.body.email, 'testuser2@example.org');
        assert(response.body.username, 'testuser2');
        done();
      });
  });

  it('Login User1', function (done) {
    request
      .post('/api/users/login')
      .send({
        username: 'testuser2',
        password: 'test',
      })
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .then(function (response) {
        assert(response.body.id);
        user2 = response.body;
        user2.token = user2.id;
        done();
      });
  });

  it('User2 Can\'t get list of User1 ', function(done) {
    request
      .get('/api/users/' + user1.userId + '/lists/?access_token=' + user2.token)
      .expect(401, done);
  });

});
