'use strict';

var http = require('http');
var fs = require('fs');
var crypto = require('crypto');
var runBrowser = require('run-browser');
var concat = require('concat-stream');
var util = require('util');

var handler = runBrowser.createHandler(require.resolve('./index.js'));

var resultHandlers = [];
function onResult(pass) {
  for (var i = 0; i < resultHandlers.length; i++) {
    resultHandlers[i](pass);
  }
}
var server = http.createServer(function (req, res) {
  if (runBrowser.handles(req)) {
    return handler(req, res);
  }
  if (req.url === '/result/pass') {
    onResult(true);
    res.end();
  }
  if (req.url === '/result/fail') {
    onResult(false);
    res.end();
  }
  res.setHeader('My-Header', 'value');
  if (req.url === '/204') {
    req = {
      httpVersion: req.httpVersion,
      headers: req.headers,
      method: req.method,
      url: req.url
    };
    // console.log(util.inspect(req, {colors: true}).replace(/^/gm, '  '));
    res.statusCode = 204;
    return res.end();
  }
  req.pipe(concat(function (body) {
    req = {
      httpVersion: req.httpVersion,
      headers: req.headers,
      method: req.method,
      url: req.url,
      body: body
    };
    // console.log(util.inspect(req, {colors: true}).replace(/^/gm, '  '));
    var shasum = crypto.createHash('sha1');
    shasum.update(req.httpVersion);
    shasum.update(req.headers['host'] || '');
    shasum.update(req.headers['headers-a'] || '');
    shasum.update(req.headers['headers-b'] || '');
    shasum.update(req.headers['authorization'] || '');
    shasum.update(req.headers['accept'] || '');
    shasum.update(req.headers['content-type'] || '');
    shasum.update(req.headers['content-length'] || '');
    shasum.update(req.headers['transfer-encoding'] || '');
    shasum.update(req.url);
    shasum.update(req.body);
    res.end(shasum.digest('hex'));
  }));
});

server.listen(3000);
module.exports.close = function () {
  server.close();
};
module.exports.on = function (name, fn) {
  if (name === 'result') {
    resultHandlers.push(fn);
  }
};