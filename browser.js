'use strict';

var Promise = require('promise');
var Response = require('request-shared/lib/response');

module.exports = doRequest;
function doRequest(uri, options) {
  return new Promise(function (resolve, reject) {
    var xhr = new window.XMLHttpRequest();

    // 1 - handle variable list of arguments
    if (typeof uri === 'undefined') {
      throw new TypeError('undefined is not a valid uri or options object.');
    }
    if (options && typeof options === 'object') {
      options.uri = uri;
    } else if (typeof uri === 'string') {
      options = {uri: uri};
    } else {
      options = uri;
    }
    options = copy(options);
    if (options.url && !options.uri) {
      options.uri = options.url;
      delete options.url;
    }
    options.headers = options.headers || {};

    // 2 - handle cross domain option
    if (!options.crossDomain) {
      var match;
      options.crossDomain = !!((match = /^([\w-]+:)?\/\/([^\/]+)/.exec(options.uri)) &&
                               (match[2] != window.location.host));
    }
    if (!options.crossDomain) options.headers['X-Requested-With'] = 'XMLHttpRequest';

    options.method = (options.method || 'GET').toUpperCase();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var headers = {};
        xhr.getAllResponseHeaders().split('\r\n').forEach(function (header) {
          var h = header.split(':');
          if (h.length > 1) {
            headers[h[0].toLowerCase()] = h.slice(1).join(':').trim();
          }
        });
        resolve(new Response(xhr.status, headers, xhr.responseText));
      }
    };
    // type, uri, async
    xhr.open(options.method, options.uri, true);

    for (var name in options.headers) {
      xhr.setRequestHeader(name.toLowerCase(), options.headers[name]);
    }

    // avoid sending empty string (#319)
    xhr.send(options.body ? options.body : null);
  });
}

function copy(obj, seen) {
  seen = seen || [];
  if (seen.indexOf(obj) !== -1) {
    throw new Error('Unexpected circular reference in options');
  }
  seen.push(obj);
  if (Array.isArray(obj)) {
    return obj.map(function (item) {
      return copy(item, seen);
    });
  } else if (obj && typeof obj === 'object') {
    var o = {}
    Object.keys(obj).forEach(function (i) {
      o[i] = copy(obj[i], seen)
    })
    return o
  } else {
    return obj;
  }
}

function empty() {
}

