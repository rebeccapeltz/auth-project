'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const authRouter = require('./route/auth-routes');
const bearRouter = require('./route/bear-routes')

mongoose.connect(process.env.DB_SERVER ||'mongodb://localhost/dev_db');

app.use('/api', authRouter);
app.use('/api/bears', bearRouter)

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message
  });
  next(err);
});

app.use('*', (req, res) => {
  res.status(404).json({
    message: 'not found'
  });
});
module.exports = app;
//app.listen(3000);
