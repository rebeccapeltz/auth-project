'use strict';
const errorMsg = require('debug')('cfdemo:error');

module.exports = exports = function(statusCode, cb, message) {
  return function(error) {
    message = message || error.message;
    errorMsg('error handler',statusCode, message);
    return cb({error, message, statusCode});
  };
};
