'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const secret = process.env.APP_SECRET || 'changeme';
console.log('secret',secret);
const jwt = require('jsonwebtoken');

const User = new mongoose.Schema({
  username: String,
  basic: {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  role: {
    type: String,
    default: 'basic',
    required: true
  }
});
// mongoose 'methods' are instance methods
User.methods.hashPasswordSync = function() {
  // var salt = bcrypt.genSaltSync(8);
  // // Hash the password with the salt
  // console.log('password',this);
  // return bcrypt.hashSync(this.basic.password, 8);
  return bcrypt.hashSync(this.basic.password, 8);
};
User.methods.hashPasswordAsync = function(){
  let password = this.basic.password;
  return new Promise(function(resolve, reject){

    bcrypt.hash(password, 10, function(err,hashedPassword){
      if (err) reject(err);
      resolve(hashedPassword);
    });
  });
};

User.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

User.methods.generateToken = function() {
  return jwt.sign({
    idd: this.basic.email
  }, secret);
};

module.exports = mongoose.model('user', User);
