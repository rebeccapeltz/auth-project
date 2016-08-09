'use strict';

const Bear = require('../model/bear');
const jsonParser = require('body-parser').json();
const jwt_auth = require('../lib/jwt-auth');
const authzn = require('../lib/authorization');
let bearRouter = module.exports = exports = require('express').Router();

bearRouter.get('/', (req, res, next) => {
  Bear.find({}, (err, bears) => {
    if (err) return next(new Error('problem finding bears'));
    res.json({
      bears
    });
  });
});

//if it makes it through parser, jwt_auth and authzn you can continue
//otherwise an error has been generated and sent to (err, req, res, next)
bearRouter.post('/', jsonParser, jwt_auth, authzn(['wrangler']), (req, res, next) => {
  req.body.wranglerId = req.user._id;
  Bear(req.body).save((err, bear) => {
    if (err) next(new Error('problem saving bear'));
    res.json({
      bear
    });
  });
});
