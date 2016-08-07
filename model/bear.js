'use strict';
const mongoose = require('mongoose');

module.exports = exports = mongoose.model('Bear', {
  name: {type: String, required: true},
  flavor: {type: String, default: 'grizzly'},
  fishPreference: {type: String, default: 'salmons'},
  wranglerId: String
});
