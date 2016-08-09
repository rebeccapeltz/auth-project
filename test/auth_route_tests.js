'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
process.env.APP_SECRET = 'test';
const mongoose = require('mongoose');
const User = require('../model/user');
let testDebug = require('debug')('cfdemo:test');
const jwtAuth = require('../lib/jwt-auth');

mongoose.Promise = global.Promise;

process.on('exit', (code) => {
  testDebug('exit code', code);
  mongoose.connection.db.dropDatabase(() => console.log('db dropped'));
});

//const User = require('../models/user');
const app = require('../server');
app.get('/api/jwt_auth', jwtAuth, function(req, res) {
  res.json({
    msg: 'success!'
  });
});
process.env.DB_SERVER = 'mongodb://localhost/test_db';

describe('Authentication tests:', function() {
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
          //testDebug('token', this.token)
          done();
        });
    });

    it('should not authenticate with bad credentials', function(done) {
      chai.request(url)
        .get('/signin')
        .auth('bad', 'credentials')
        .end((err, res) => {
          expect(err).to.not.eql(null);
          expect(res).to.have.status(401);
          expect(res.error.text).to.eql('"user does not exist"'); //need the extra double quote
          expect(res.body).to.eql('user does not exist');
          done();
        });
    });

    it('should authenticate with a token', function(done) {
      chai.request(url)
        .get('/jwt_auth')
        .set('Authorization', 'Bearer ' + this.token)
        .end((err, res) => {
          expect(err).to.eql(null);
          expect(res.body.msg).to.eql('success!');
          done();
        });
    });

    it('should not authenticate without a token', function(done) {
      chai.request(url)
        .get('/jwt_auth')
        .end((err, res) => {
          expect(err.message).to.eql('Unauthorized');
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});
