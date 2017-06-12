'use strict';
process.env.NODE_ENV = 'test';

var request = require('supertest');
var assert = require('assert');
var app = require('../server/server');

var user1Auth = '';
var user1List = '';
var user2Auth = '';

describe('Lists - Unauthenticated', function() {

  it('Initially 0 lists', function(done) {
    app.models.List.count({}, function(err, count) {
      assert.deepEqual(count, 0);
      done();
    });
  });

  it('Doesn\'t allow unauthenticated reading', function(done) {
    request(app).get('/api/lists')
    .expect(401, done);
  });

  it('Doesn\'t allow unauthenticated list creation', function(done) {
    request(app).post('/api/lists')
    .send({
      name: 'test list 1',
      description: 'testing unauthenticated',
    })
    .expect(401, done);
  });
});

describe('Lists - Authenticated', function() {

  it('Register User1', function(done) {
    request(app).post('/api/users')
    .send({
      username: 'testuser1',
      email: 'testuser1@example.org',
      password: 'test',
    })
    .expect(200)
    .then(function(response) {
      assert(response.body.email, 'testuser1@example.org');
      assert(response.body.username, 'testuser1');
      done();
    });
  });

  it('Login User1', function(done) {
    request(app).post('/api/users/login')
    .send({
      username: 'testuser1',
      password: 'test',
    })
    .expect(200)
    .then(function(response) {
      assert(response.body.id);
      user1Auth = response.body.id;
      done();
    });
  });

  it('Create List as User1', function(done) {
    request(app).post('/api/lists?access_token=' + user1Auth)
    .send({
      name: 'test list 2',
      description: 'testing authenticated',
      access_token: user1Auth,
    })
    .expect(200)
    .then(response => {
      assert(response.body.id);
      user1List = response.body.id;
      done();
    });
  });

  it('Get Lists as User1', function(done) {
    request(app).get('/api/lists?access_token=' + user1Auth)
    .expect(200)
    .then(function(response) {
      assert(response.body.length, 1);
      done();
    });
  });

  it('Get single list as User1', function(done) {
    request(app).get('/api/lists/'+ user1List +'?access_token=' + user1Auth)
    .expect(200)
    .then(response => {
      assert(response.body.id);
      done();
    });
  });

});



describe('Lists - Authenticated Multiuser', function() {

  it('Register User2', function(done) {
    request(app).post('/api/users')
    .send({
      username: 'testuser2',
      email: 'testuser2@example.org',
      password: 'test',
    })
    .expect(200)
    .then(function(response) {
      assert(response.body.email, 'testuser2@example.org');
      assert(response.body.username, 'testuser2');
      done();
    });
  });

  it('Login User2', function(done) {
    request(app).post('/api/users/login')
    .send({
      username: 'testuser2',
      password: 'test',
    })
    .expect(200)
    .then(function(response) {
      assert(response.body.id);
      user2Auth = response.body.id;
      done();
    });
  });

  it('User2 Can\'t get list of User1 ', function(done) {
    request(app).get('/api/lists/'+ user1List +'?access_token=' + user2Auth)
    .expect(401, done);
  });

});
