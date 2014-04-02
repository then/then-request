'use strict';

var Promise = require('promise');
var Request = require('request-shared').Request;
var Response = require('request-shared').Response;
var concat = require('concat-stream');
var protocols = {
  http: require('http'),
  https: require('https')
};

module.exports = doRequest;
function doRequest(url, options) {
  return new Promise(function (resolve, reject) {
    var request = new Request(url, options);
    if (['http', 'https'].indexOf(request.protocol) === -1) {
      throw new Error('Invalid protocol ' + request.protocol);
    }
    var http = protocols[request.protocol];
    delete request.protocol;
    var req = http.request(request, function (res) {
      var body = '';
      res.once('error', reject);
      res.pipe(concat(function (body) {
        resolve(new Response(res.statusCode, res.headers, Array.isArray(body) ? new Buffer(0) : body));
      }));
    });
    req.once('error', reject);
    req.end(request.body);
  });
}