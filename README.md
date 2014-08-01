# then-request

A request library that returns promises, inspired by request

[![Build Status](https://img.shields.io/travis/then/request/master.svg)](https://travis-ci.org/then/request)
[![Dependency Status](https://img.shields.io/gemnasium/then/request.svg)](https://gemnasium.com/then/request)
[![NPM version](https://img.shields.io/npm/v/then-request.svg)](https://www.npmjs.org/package/then-request)

## Installation

    npm install then-request

## Usage

`request(method, url, options, callback?)`

e.g.

```js
request('GET', 'http://example.com').done(function (res) {
  console.log(res.getBody());
});
```

**Method:**

An HTTP method (e.g. `GET`, `POST`, `PUT`, `DELETE` or `HEAD`). It is not case sensitive.

**URL:**

A url as a string (e.g. `http://example.com`). Relative URLs are allowed in the browser.

**Options:**

 - `qs` - an object containing querystring values to be appended to the uri
 - `headers` - http headers (default: `{}`)
 - `body` - body for PATCH, POST and PUT requests.  Must be a `Buffer` or `String` (only strings are accepted client side)
 - `json` - sets `body` but to JSON representation of value and adds `Content-type: application/json`.  Does not have any affect on how the response is treated.
 - `cache` - only used in node.js (browsers already have their own caches) Can be `'memory'`, `'file'` or your own custom implementaton (see https://github.com/ForbesLindesay/http-basic#implementing-a-cache).

**Callback / Returns:**

If a callback is provided it is called with `err` and `res`. If no callback is provided, a [Promise](https://www.promisejs.org/) is returned that eventually resolves to `res`.  The resulting Promise also has an additional `.getBody(encoding?)` method that is equivallent to calling `.then(function (res) { return res.getBody(); })`.

### Response

Note that even for status codes that represent an error, the promise will be resolved as the request succeeded.  You can call `getBody` if you want to error on invalid status codes.  The response has the following properties:

 - `statusCode` - a number representing the HTTP status code
 - `headers` - http response headers
 - `body` - a string if in the browser or a buffer if on the server

It also has a method `getBody(encoding?)` which looks like:

```js
function getBody(encoding) {
  if (this.statusCode >= 300) {
    var err = new Error('Server responded with status code ' + this.statusCode + ':\n' + this.body.toString(encoding));
    err.statusCode = this.statusCode;
    err.headers = this.headers;
    err.body = this.body;
    throw err;
  }
  return encoding ? this.body.toString(encoding) : this.body;
}
```

## License

  MIT
