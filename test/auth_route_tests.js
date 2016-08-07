'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
process.env.APP_SECRET = 'test';
const mongoose = require('mongoose');
const User = require('../model/user');
//const jwt_auth = require('../lib/jwt_auth');

//const User = require('../models/user');
const app = require('../server');
process.env.DB_SERVER = 'mongodb://localhost/test_db';

describe('authentication', function() {
  let server;
  let url;
  let port = 3003;
  before(function(done) {
    server = app.listen(port);
    url = 'localhost:3003/api';
    done();
  });
  after(function(done) {
    mongoose.connection.db.dropDatabase(() => {
      server.close();
      console.log('db on server with port ' + port + ' dropped');
      done();
    });
  });
  it('should create a user', function(done) {
    chai.request(url)
      .post('/signup')
      .set('content-type', 'application/json')
      .send({
        email: 'testing@example.com',
        password: 'foobar123'
      })
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.body).to.have.property('token');
        expect(res.body.token.length).to.not.eql(0);
        done();
      });
  });


  describe('with a user in the database', function() {

    before(function(done) {
      let testUser = new User({
        username: 'test',
        basic: {
          email: 'test',
          password: 'password'
        }
      });
      let hashedPassword = testUser.hashPasswordSync();
      testUser.basic.password = hashedPassword;
      this.token = testUser.generateToken();
      testUser.save((err, user) => {
        this.user = user;
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
          console.log('token', this.token)
          done();
        });
    });

    it('should not authenticate with bad credentials', function(done) {
      chai.request(url)
        .get('/signin')
        .auth('bad', 'credentials')
        .end((err, res) => {
          expect(err.message).to.eql('Unauthorized');
          done();
        });
    });
    //
    // it('should authenticate with a token', function(done) {
    //   chai.request(baseUrl)
    //     .get('/jwt_auth')
    //     .set('Authorization', 'Bearer ' + this.tokenData.token)
    //     .end((err, res) => {
    //       expect(err).to.eql(null);
    //       expect(res.body.msg).to.eql('success!');
    //       done();
    //     });
    // });
    //
    // it('should not authenticate without a token', function(done) {
    //   chai.request(baseUrl)
    //     .get('/jwt_auth')
    //     .end((err, res) => {
    //       expect(err.message).to.eql('Unauthorized');
    //       expect(res).to.have.status(401);
    //       done();
    //     });
    // });
  });
});
