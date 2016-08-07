'use strict';
const assert = require('assert');

module.exports = exports = function(roles) {
  roles = ['admin'].concat(roles);
  return function(req, res, next) {
    if (!req.user) next(new Error('Authorization failed: no user'));
    if (roles.indexOf(req.user.role) === -1) next(new Error('401 Authorization failed: need credentials'))
    next();
  }
};
