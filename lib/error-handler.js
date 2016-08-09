'use strict';
const errorMsg = require('debug')('cfdemo:error');



module.exports = exports = function(statusCode, cb, message) {
  function CustomError(error,message, statusCode) {
    this.error = error;
    this.message = message;
    this.statusCode = statusCode;
  }
  CustomError.prototype.toString = function() {
    return JSON.stringify(this);
  }
  return function(error) {
    let errMsg = message || error.message;
    errorMsg('error handler', statusCode, errMsg);
    var customError = new CustomError(error, errMsg, statusCode);
    return cb(customError);
  };
};
