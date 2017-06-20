'use strict';

import {HttpVerb} from 'http-basic/lib/HttpVerb';
import Response = require('http-response-object');
import Promise = require('promise');
import concat = require('concat-stream');
import {Options} from './Options';
import toResponsePromise, {ResponsePromise} from './ResponsePromise';
import {RequestFn} from './RequestFn';
import handleQs from './handle-qs';
import _basicRequest = require('http-basic');

const caseless = require('caseless');

let basicRequest = _basicRequest;

function request(method: HttpVerb, url: string, options?: Options): ResponsePromise {
  return toResponsePromise(new Promise((resolve: (v: Response<Buffer | string>) => void, reject: (e: any) => void) => {
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

    // handle json body
    if (options.json) {
      options.body = JSON.stringify(options.json);
      headers.set('Content-Type', 'application/json');
    }

    var body = options.body ? options.body : new Buffer(0);
    if (typeof body === 'string') body = new Buffer(body);
    if (!Buffer.isBuffer(body)) {
      throw new TypeError('body should be a Buffer or a String');
    }
    if (!headers.has('Content-Length')) {
      headers.set('Content-Length', body.length);
    }

    var req = basicRequest(method, url, {
      allowRedirectHeaders: options.allowRedirectHeaders,
      headers: options.headers,
      followRedirects: options.followRedirects !== false,
      maxRedirects: options.maxRedirects,
      gzip: options.gzip !== false,
      cache: options.cache,
      agent: options.agent !== false,
      timeout: options.timeout,
      socketTimeout: options.socketTimeout,
      retry: options.retry,
      retryDelay: options.retryDelay,
      maxRetries: options.maxRetries,

      isMatch: options.isMatch,
      isExpired: options.isExpired,
      canCache: options.canCache,
    }, (err: NodeJS.ErrnoException, res: Response<NodeJS.ReadableStream>) => {
      if (err) return reject(err);
      res.body.on('error', reject);
      res.body.pipe(concat((body: Buffer) => {
        resolve(
          new Response(
            res.statusCode,
            res.headers,
            Array.isArray(body) ? new Buffer(0) : body,
            res.url
          )
        );
      }));
    });

    if (req) {
      req.end(body);
    }
  }));
}

(request as any)._setBasicRequest = (_basicRequest: any) => basicRequest = _basicRequest;

export = (request as RequestFn);
