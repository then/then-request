'use strict';

import {HttpVerb} from 'http-basic/lib/HttpVerb';
import GenericResponse = require('http-response-object');
import Promise = require('promise');
import concat = require('concat-stream');
import { Headers } from 'http-basic/lib/Headers';
import {Options} from './Options';
import toResponsePromise, {ResponsePromise} from './ResponsePromise';
import {RequestFn} from './RequestFn';
import handleQs from './handle-qs';
import _basicRequest = require('http-basic');
import FormData = require('form-data');

type Response = GenericResponse<Buffer | string>;
export {HttpVerb, Headers, Options, ResponsePromise, Response};

const caseless = require('caseless');

let basicRequest = _basicRequest;

interface NormalizedBody {
  getHeaders(): Promise<Headers>;
  pipe(stream: NodeJS.WritableStream): void;
}
class BufferBody implements NormalizedBody {
  private _body: Buffer;
  private _headers: Headers;
  constructor(body: Buffer, extraHeaders: Headers) {
    this._body = body;
    this._headers = extraHeaders;
  }
  getHeaders(): Promise<Headers> {
    return Promise.resolve({'content-length': '' + this._body.length, ...this._headers});
  }
  pipe(stream: NodeJS.WritableStream) {
    stream.end(this._body);
  }
}
class FormBody implements NormalizedBody {
  private _body: FormData;
  constructor(body: FormData) {
    this._body = body;
  }
  getHeaders(): Promise<Headers> {
    const headers = this._body.getHeaders();
    return new Promise((resolve, reject) => {
      let gotLength = false;
      this._body.getLength((err: any, length: number) => {
        if (gotLength) return;
        gotLength = true;
        if (err) {
          return reject(
            typeof err == 'string'
            ? new Error(err)
            : err
          );
        }
        headers['content-length'] = '' + length;
        resolve(headers);
      });
    });
  }
  pipe(stream: NodeJS.WritableStream) {
    this._body.pipe(stream);
  }
}
function handleBody(options: Options): NormalizedBody {
  if (options.form) {
    return new FormBody(options.form);
  }
  const extraHeaders: {[key: string]: string | string[]} = {};
  let body = options.body;
  if (options.json) {
    extraHeaders['content-type'] = 'application/json';
    body = JSON.stringify(options.json);
  }
  if (typeof body === 'string') {
    body = Buffer.from(body);
  }
  if (!body) {
    body = new Buffer(0);
  }
  if (!Buffer.isBuffer(body)) {
    throw new TypeError('body should be a Buffer or a String');
  }
  return new BufferBody(body, extraHeaders);
}

function request(method: HttpVerb, url: string, options: Options = {}): ResponsePromise {
  return toResponsePromise(new Promise((resolve: (v: Response) => void, reject: (e: any) => void) => {
    // check types of arguments

    if (typeof method !== 'string') {
      throw new TypeError('The method must be a string.');
    }
    if (typeof url !== 'string') {
      throw new TypeError('The URL/path must be a string.');
    }
    if (options == null) {
      options = {};
    }
    if (typeof options !== 'object') {
      throw new TypeError('Options must be an object (or null).');
    }

    method = (method.toUpperCase() as any);
    options.headers = options.headers || {};
    var headers = caseless(options.headers);

    // handle query string
    if (options.qs) {
      url = handleQs(url, options.qs);
    }

    const duplex = !(method === 'GET' || method === 'DELETE' || method === 'HEAD');
    if (duplex) {
      const body = handleBody(options);
      body.getHeaders().then((bodyHeaders: Headers) => {
        Object.keys(bodyHeaders).forEach(key => {
          if (!headers.has(key)) {
            headers.set(key, bodyHeaders[key]);
          }
        });
        ready(body);
      }).catch(reject);
    } else if (options.body) {
      throw new Error(
        'You cannot pass a body to a ' + method + ' request.'
      );
    } else {
      ready();
    }
    function ready(body?: NormalizedBody) {
      const req = basicRequest(method, url, {
        allowRedirectHeaders: options.allowRedirectHeaders,
        headers: options.headers,
        followRedirects: options.followRedirects !== false,
        maxRedirects: options.maxRedirects,
        gzip: options.gzip !== false,
        cache: options.cache,
        agent: options.agent,
        timeout: options.timeout,
        socketTimeout: options.socketTimeout,
        retry: options.retry,
        retryDelay: options.retryDelay,
        maxRetries: options.maxRetries,

        isMatch: options.isMatch,
        isExpired: options.isExpired,
        canCache: options.canCache,
      }, (err: NodeJS.ErrnoException, res: GenericResponse<NodeJS.ReadableStream>) => {
        if (err) return reject(err);
        res.body.on('error', reject);
        res.body.pipe(concat((body: Buffer) => {
          resolve(
            new GenericResponse(
              res.statusCode,
              res.headers,
              Array.isArray(body) ? new Buffer(0) : body,
              res.url
            )
          );
        }));
      });

      if (req && body) {
        body.pipe(req);
      }
    }
  }));
}

export {FormData};
export default (request as RequestFn);

module.exports = request;
module.exports.default = request;
module.exports.FormData = FormData;
