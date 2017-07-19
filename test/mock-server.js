const assert = require('assert');
const http = require('http');
const concat = require('concat-stream');
const Busboy = require('busboy');

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
    if (req.method === 'POST' && req.url === '/form') {
      assert(req.headers['content-length'] === '161');
      assert(/^multipart\/form-data\; boundary=/.test(req.headers['content-type']));
      const form = new Busboy({headers: req.headers});
      const data = {};
      form.on('field', (fieldName, value) => {
        data[fieldName] = value;
      });
      form.on('finish', () => {
        assert(data.foo === 'baz');
        res.statusCode = 200;
        res.end('form body');
      });
      req.pipe(form);
      return;
    }
  }).listen(3000);
}

module.exports = createServer;