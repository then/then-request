'use strict';

var chromedriver = require('chromedriver');
var cabbie = require('cabbie');
var Promise = require('promise');
var server = require('./server.js');
var clientResult = new Promise(function (resolve) {
  server.on('result', resolve);
});

var LOCAL = !process.env.CI;
var SAUCE_USER = '';
var SAUCE_KEY = '';
var SAUCE = 'http://' + SAUCE_USER + ':' +
            SAUCE_KEY + '@ondemand.saucelabs.com/wd/hub';

console.log('# Test Node');
var nodeTests = require('./index.js');

nodeTests.then(function () {
  console.log();
  console.log('# Test Client');
  if (LOCAL) {
    chromedriver.start();
    return runBrowser('http://localhost:9515/', {})
      .then(function (passed) {
        chromedriver.stop();
        if (!passed) {
          throw new Error('Client tests failed');
        }
      });
  } else {
    // todo: run all the browsers
    // todo: use sauce connect
    return runBrowser(SAUCE, {browserName: 'chrome'});
  }
}).done(function () {
  server.close();
});

function runBrowser(host, config) {
  var start;
  var browser = cabbie(host, config, {mode: 'async'});
  function getResult() {
    return browser.execute('return window.testsPassed').then(function (res) {
      if (res === true || res === false) return res;
      var now = new Date();
      if (now - start) throw new Error('Operation timed out');
      return getResult();
    });
  }
  var passed;
  return browser.sauceJobUpdate({name: 'then/request', build: process.env.TRAVIS_JOB_ID})
  .then(function () {
    return browser.setTimeouts({
      'implicit': '10s',
      'async': '10s'
    });
  }).then(function () {
    return browser.navigateTo('http://localhost:3000');
  }).then(function () {
    start = new Date();
    return getResult();
  }).then(function (res) {
    passed = res;
    return browser.getElement('#__testling_output');
  }).then(function (el) {
    return el.text();
  }).then(function (text) {
    process.stdout.write('\n');
    console.dir(config);
    process.stdout.write(text);
    process.stdout.write('\n');
    return browser.dispose(passed);
  }, function (err) {
    return browser.dispose(false).then(function () {
      throw err;
    }, function () {
      throw err;
    });
  }).then(function () {
    return passed;
  });
}