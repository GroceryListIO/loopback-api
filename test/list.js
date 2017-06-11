process.env.NODE_ENV = 'test'

var request = require('supertest');
var assert = require('assert');
var app = require('../server/server');

var errorHandler = require('strong-error-handler');
console.log(app.get('env'));


describe('Lists', function(){

  it('Initially 0 lists', function(done){
      app.models.List.count({}, function(err, count){
        assert.deepEqual(count, 0);
        done();
      });
  });

  it('Doesn\'t allow unauthenticated creation', function(done){
      request(app).post('/api/lists')
      .send({
        name: "test list 1",
        description: "testing unauthenticated"
      })
      .expect(401, done)
  });

});
