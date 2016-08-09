'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
process.env.APP_SECRET = 'test';
const mongoose = require('mongoose');
const User = require('../model/user');
let testDebug = require('debug')('cfdemo:test');
const app = require('../server');

mongoose.Promise = global.Promise;

process.on('exit', (code) => {
  testDebug('exit code', code);
  mongoose.connection.db.dropDatabase(() => console.log('db dropped'));
});



describe('with a user in the database', function() {
  let server;
  let url;
  let port = 3003;
  before(function(done) {

    //listen on server
    server = app.listen(port);
    url = 'localhost:3003/api';

    let testUser = new User({
      username: 'test',
      basic: {
        email: 'test',
        password: 'password'
      },
      role: 'admin'
    });
    // save user
    let hashedPassword = testUser.hashPasswordSync();
    testUser.basic.password = hashedPassword;
    this.token = testUser.generateToken();
    testUser.save((err, user) => {
      this.user = user;
      done();
    });
  });
  after(function(done) {
    mongoose.connection.db.dropDatabase(() => {
      server.close();
      console.log('db on server with port ' + port + ' dropped');
      done();
    });
  });




  it('should post with a token from admin use', function(done) {
    chai.request(url)
      .get('/bears')
      .set('Authorization', 'Bearer ' + this.token)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(err).to.eql(null);
        done();
      });
  });

  it('should authenticate with an existing user', function(done) {
    chai.request(url)
      .get('/signin')
      .auth('test', 'password')
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(res.body).to.have.property('token');
        expect(res.body.token.length).to.not.equal(0);
        done();
      });
  });
  it('should not authenticate with bad credentials', function(done) {
    chai.request(url)
    .get('/signin')
    .auth('bad', 'credentials')
    .end((err, res) => {
      expect(res).to.have.status(401);
      expect(err.message).to.eql('Unauthorized');
      done();
    });
  });

});
