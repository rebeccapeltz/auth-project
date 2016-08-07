'use strict';

const jwt = require('jsonwebtoken');
const User = require('../model/user.js');
const secret = process.env.SECRET || 'changeme';

module.exports = function(req, res, next) {
  let token = req.body.token || req.headers.token;
  let tokenErr = new Error('Authorization Failure');
  let decodedToken;

  if (!token) return next(tokenErr);

  try {
    decodedToken = jwt.verify(token, secret);
    User.findOne({
      _id: decodedToken._id
    }, (err, user) => {
      if (!user || err) return next(tokenErr);
      req.user = user;
      next();
    });
  } catch (e) {
    return next(tokenErr);
  }


};
