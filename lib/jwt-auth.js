'use strict';

const jwt = require('jsonwebtoken');
//const assert = require('assert');
const User = require('../model/user');
const ErrorHandler = require('./error-handler');

module.exports = exports = function(req, res, next) {
  //new Promise((resolve, reject) => {
  let authheader = req.headers.authorization;
  //assert(typeof authheader === 'string', 'No auth token provided');
  if (typeof authheader !== 'string') {
    return ErrorHandler(401, next)(new Error('No auth token provided'));
  }
  authheader = authheader.split(' ');
  //assert(authheader[0] === 'Bearer', 'No auth token provided');
  if (authheader[0] !== 'Bearer') {
    return ErrorHandler(401, next)(new Error('Improper authorization header'));
  }
  let decoded = jwt.verify(authheader[1], process.env.APP_SECRET || 'changeme');
  //assert(decoded, 'Invalid Token');
  if (!decoded) {
    return ErrorHandler(401, next)(new Error('Invalid aut token'));
  }
  User.findOne({
    'basic.email': decoded.idd
  }, (err, user) => {
    if (err) next(err.message); //we just want to get out of here if there is no user found
    if (!user) next(new Error('user not identifiable'));
    req.user = user;
    next();
  });
};
// module.exports = exports = function(req, res, next) {
//   new Promise((resolve, reject) => {
//     let authheader = req.headers.authorization;
//     assert(typeof authheader === 'string', 'No auth token provided');
//     authheader = authheader.split(' ');
//     assert(authheader[0] === 'Bearer', 'No auth token provided');
//     let decoded = jwt.verify(authheader[1], process.env.APP_SECRET);
//     assert(decoded, 'Invalid Token');
//     User.findOne({'basic.email': decoded.idd})
//       .then((user) => {
//         assert(user !== null, 'Could not find user');
//         req.user = user;
//         next();
//         resolve(user);
//       }, reject);
//   }).catch(ErrorHandler(401, next));
// };
//
