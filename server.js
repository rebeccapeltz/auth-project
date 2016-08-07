'use strict';
//node-inspector in another window
//mocha [options] --debug-brk
//DEBUG=cfdemo:test mocha

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const authRouter = require('./route/auth-routes');
const bearRouter = require('./route/bear-routes');


let serverError = require('debug')('cfdemo:server');

mongoose.connect(process.env.DB_SERVER || 'mongodb://localhost/dev_db');

app.use('/api', authRouter);
app.use('/api/bears', bearRouter);


app.use((err, req, res, next) => {
  serverError(err);
  res.status(err.statusCode || 500).json(err.message);
  next();
});



module.exports = app;
