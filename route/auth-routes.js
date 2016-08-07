'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const User = require('../model/user');
const basicHTTP = require('../lib/basic_http');
const jwtAuth = require('../lib/jwt-auth');
const authzn = require('../lib/authorization');
const errorHandler = require('../lib/error-handler');

const router = module.exports = exports = express.Router();

// json parse on routes - body has posted objects
router.post('/signupSync', jsonParser, (req, res, next) => {
  //construct user from body and hash password
  let newUser = new User();
  newUser.basic.email = req.body.email;
  if (req.body.role) newUser.role = req.body.role;
  newUser.username = req.body.username || req.body.email;
  newUser.basic.password = req.body.password;
  let hashedPassword = newUser.hashPasswordSync();
  newUser.basic.password = hashedPassword;
  req.body.password = null; //set password to null
  User.findOne({
    username: req.body.username
  }, (err, user) => {
    if (err || user) return next(new Error('could not create user - one already exists or error'));
    newUser.save((err, user) => {
      //Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
      if (err) {
        return next(new Error('could not create user' + req.body.username));

      }
      res.json({
        token: user.generateToken()
      });
    });
  });
});
router.post('/signup', jsonParser, (req, res, next) => {
  //construct user from body and hash password
  let newUser = new User();
  newUser.basic.email = req.body.email;
  newUser.username = req.body.username || req.body.email;
  newUser.basic.password = req.body.password;
  newUser.role = req.body.role ? req.body.role : 'basic';

  newUser.hashPasswordAsync().then((hashedPassword) => {
    newUser.basic.password = hashedPassword;
    req.body.password = null; //set password to null
    //console.log('newUser', newUser);
    User.findOne({
      username: req.body.username
    }, (err, user) => {
      if (err || user) return next(new Error('could not create user - one already exists or error'));
      newUser.save((err, user) => {
        //Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
        if (err) {
          //console.log('err user:', user)
          return next(new Error('could not create user' + req.body.username));
        }
        res.json({
          token: user.generateToken()
        });
      });
    });
  }, (err) => {
    next(new Error(err.messsage));
  });

});


//basic http parse on signin - this puts auth {username, password} on req
router.get('/signin', basicHTTP, (req, res, next) => {
  User.findOne({
    username: req.auth.username
  }, (err, user) => {
    //if (err || !user) return next(new Error('could not sign in - user does not exist'));
    if (err || !user) return errorHandler(401, next)(new Error('user does not exist'));
    //if (!user.comparePassword(req.auth.password)) return next(new Error('could not sign in - password not valid'));
    if (!user.comparePassword(req.auth.password)) errorHandler(401,next)(new Error('password invalid'));
    res.json({
      token: user.generateToken()
    });
  });
});

router.get('/users', jsonParser, jwtAuth, authzn, (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) return next(new Error('problem finding users'));
    res.json({
      users
    });
  });
});
