import { Agent } from 'http';
import { Headers } from 'http-basic/lib/Headers';
import { ICache } from 'http-basic/lib/ICache';
import Response = require('http-response-object');
import {CachedResponse} from 'http-basic/lib/CachedResponse';

interface Options {
  allowRedirectHeaders?: string[];
  cache?: 'file' | 'memory' | ICache;
  followRedirects?: boolean;
  gzip?: boolean;
  headers?: Headers;
  maxRedirects?: number;
  maxRetries?: number;
  retry?: boolean | ((err: NodeJS.ErrnoException | null, res: Response<NodeJS.ReadableStream | Buffer | string> | void, attemptNumber: number) => boolean);
  retryDelay?: number | ((err: NodeJS.ErrnoException | null, res: Response<NodeJS.ReadableStream | Buffer | string> | void, attemptNumber: number) => number);
  socketTimeout?: number;
  timeout?: number;

  isMatch?: (requestHeaders: Headers, cachedResponse: CachedResponse, defaultValue: boolean) => boolean;
  isExpired?: (cachedResponse: CachedResponse, defaultValue: boolean) => boolean;
  canCache?: (res: Response<NodeJS.ReadableStream>, defaultValue: boolean) => boolean;

  // extra options

  qs?: {[key: string]: any};
  json?: any;
  body?: string | Buffer;
}
export {Options};