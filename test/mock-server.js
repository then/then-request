  // assert(typeof callback === 'function');
  // var duplex = !(method === 'GET' || method === 'DELETE' || method === 'HEAD');
  // if (duplex) {
  //   return {
  //     end: function (body) {
  //       gotResponse(getResponse(method, url, options.headers, body, {isClient: false}));
  //     }
  //   };
  // } else {
  //   gotResponse(getResponse(method, url, options.headers, null, {isClient: false}));
  // }
  // function gotResponse(res) {
  //   var stream = new PassThrough();
  //   stream.end(res.body);
  //   res.body = stream;
  //   callback(null, res);
  // }
const assert = require('assert');
const http = require('http');
const concat = require('concat-stream');

function createServer() {
  return http.createServer((req, res) => {
    const {method, url, headers} = req;
    if (method === 'GET' && url === '/') {
      res.statusCode = 200;
      res.setHeader('FoO', 'bar');
      res.end('body');
      return;
    }
    if (method === 'GET' && url === '/?foo=baz') {
      res.statusCode = 200;
      res.setHeader('FoO', 'baz');
      res.end('body');
      return;
    }
    if (method === 'POST' && url === '/') {
      assert(headers['content-type'] === 'application/json');
      req.pipe(concat(body => {
        assert(JSON.parse(body.toString()).foo === 'baz');
        res.statusCode = 200;
        res.end('json body');
      }));
      return;
    }
  }).listen(3000);
}

module.exports = createServer;