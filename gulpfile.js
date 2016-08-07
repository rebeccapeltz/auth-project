'use strict';
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const exec = require('gulp-exec');

require('gulp-watch');

gulp.task('watch', function() {
  gulp.watch(['*.js', '../test/*.js'], ['lint', 'mocha']);
});

gulp.task('default', ['mocha', 'lint', 'watch'], function() {});

gulp.task('lint', function() {
  gulp.src(['./*.js', './test/*.js', './lib/*.js'])
    .pipe(eslint()) //{} pass in rules
    .pipe(eslint.format());
});

gulp.task('mocha', function() {
  return gulp.src('./test/*.js', {
    read: false
  })
    .pipe(mocha({
      reporter: 'nyan'
    }));
});
gulp.task('start', function(cb) {
  exec('nodemon ./index.js', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});
gulp.task('serverxxx', function(cb) {
  exec('node ./index.js', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
  exec('mongod --dbpath ./data', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});
