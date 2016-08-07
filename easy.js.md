``` JavaScript
//server
'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const authRouter = require('./route/auth_routes');

mongoose.connect('mongodb://localhost/dev_db');

app.use('/', authRouter);

app.use((err, req, res, next) => {
  res.status(500).json({message: err.message});
  next(err);
});

app.use('*', (req,res) => {
  res.status(404).json({message: 'not found'});
});

app.listen(3000);


//router
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const User = require('../model/user');
const basicHTTP = require('../lib/basic_http');

const router = module.exports = exports = express.Router();

router.post('/signup', jsonParser, (req, res, next) => {
  let newUser = new User(req.body);
  let hashedPassword = newUser.hashPassword();
  newUser.password = hashedPassword;
  req.body.password = null;
  User.findOne({username: req.body.username}, (err, user) => {
    if (err || user) return next(new Error('could not create user - one already exists or error'));
    newUser.save((err, user) => {
      if(err) return next(new Error('could not create user'));
      res.json({token: user.generateToken()});
    });
  });
});

router.get('/signin', basicHTTP, (req, res, next) => {
  User.findOne({username: req.auth.username}, (err, user) => {
    if(err || !user) return next(new Error('could not sign in - user does not exist'));
    if(!user.comparePassword(req.auth.password)) return next(new Error('could not sign in - password not valid'));
    res.json({token: user.generateToken()});
  });
});
Contact GitHub API Training Shop Blog About

//model
'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const secret = process.env.SECRET || 'changeme';
const jwt = require('jsonwebtoken');

const User = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true}
});

User.methods.hashPassword = function() {
  return bcrypt.hashSync(this.password, 8);
};

User.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

User.methods.generateToken = function() {
  return jwt.sign({_id: this._id}, secret);
};

module.exports = mongoose.model('user', User);

//Middleware
 //basic http
 'use strict';

module.exports = function(req, res, next) {
  let basicAuth = req.headers.authorization;
  let authString = basicAuth.split(' ').pop();
  let authBuff = new Buffer(authString, 'base64');
  let asciiAuth = authBuff.toString();
  let authArray = asciiAuth.split(':');
  authBuff.fill(0);

  req.auth = {
    username: authArray[0],
    password: authArray[1]
  };

  if(!req.auth.username || !req.auth.password) {
    return next(new Error('Username or Password missing'));
  }

  next();
};

// jwt auth
'use strict';

const jwt = require('jsonwebtoken');
const User = require('../model/user.js');
const secret = process.env.SECRET || 'changeme';

module.exports = function(req, res, next) {
  let token = req.body.token || req.headers.token;
  let tokenErr = new Error('Authorization Failure');
  let decodedToken;

  if(!token) return next(tokenErr);

  try {
    decodedToken = jwt.verify(token, secret);
  } catch(e) {
    return next(tokenErr);
  }

  User.findOne({_id: decodedToken._id}, (err, user) => {
    if(!user || err) return next(tokenErr);
    req.user = user;
    next();
  });
};

```/
