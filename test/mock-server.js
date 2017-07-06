const assert = require('assert');
const http = require('http');
const concat = require('concat-stream');

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.setHeader('FoO', 'bar');
      res.end('body');
      return;
    }
    if (req.method === 'GET' && req.url === '/?foo=baz') {
      res.statusCode = 200;
      res.setHeader('FoO', 'baz');
      res.end('body');
      return;
    }
    if (req.method === 'POST' && req.url === '/') {
      assert(req.headers['content-type'] === 'application/json');
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