'use strict';

var assert = require('assert');
var request = require('../');

module.exports = request('http://localhost:3000/foo', {method: 'POST'})
.then(function (res) {
  assert(res.statusCode === 200);
  assert(res.headers);
  assert(res.headers['my-header'] === 'value');
  assert(res.body);
});

module.exports.done(function () {
  if (typeof window !== 'undefined') {
    window.testsPassed = true;
  }
  console.log('tests passed');
}, function (err) {
  if (typeof window !== 'undefined') {
    window.testsPassed = false;
  }
  console.log('tests failed');
  throw err;
});