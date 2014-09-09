'use strict';

var assert = require('assert');
var parseUrl = require('url').parse;
var Promise = require('promise');
var concat = require('concat-stream');
var Response = require('http-response-object');
var handleQs = require('./lib/handle-qs.js');

module.exports = doRequest;
module.exports._request = require('http-basic');
function doRequest(method, url, options, callback) {
  var result = new Promise(function (resolve, reject) {
    // check types of arguments

    if (typeof method !== 'string') {
      throw new TypeError('The method must be a string.');
    }
    if (typeof url !== 'string') {
      throw new TypeError('The URL/path must be a string.');
    }
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (options === null || options === undefined) {
      options = {};
    }
    if (typeof options !== 'object') {
      throw new TypeError('Options must be an object (or null).');
    }
    if (typeof callback !== 'function') {
      callback = undefined;
    }

    method = method.toUpperCase();
    options.headers = options.headers || {};

    // handle query string
    if (options.qs) {
      url = handleQs(url, options.qs);
    }

    // handle json body
    if (options.json) {
      options.body = JSON.stringify(options.json);
      options.headers['content-type'] = 'application/json';
    }

    var body = options.body ? options.body : new Buffer(0);
    if (typeof body === 'string') body = new Buffer(body);
    assert(Buffer.isBuffer(body), 'body should be a Buffer or a String');
    if (!Object.keys(options.headers).some(function (name) { return name.toLowerCase() === 'content-length'; })) {
      options.headers['content-length'] = body.length;
    }

    var req = module.exports._request(method, url, {
      headers: options.headers,
      followRedirects: true,
      gzip: true,
      cache: options.cache
    }, function (err, res) {
      if (err) return reject(err);
      res.body.on('error', reject);
      res.body.pipe(concat(function (body) {
        resolve(new Response(res.statusCode, res.headers, Array.isArray(body) ? new Buffer(0) : body));
      }));
    });

    if (req) {
      req.end(body);
    }
  });
  result.getBody = function (encoding) {
    return result.then(function (res) { return res.getBody(encoding); });
  };
  return result.nodeify(callback);
}
