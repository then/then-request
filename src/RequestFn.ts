import {HttpVerb} from 'http-basic/lib/HttpVerb';
import {Options} from './Options';
import {ResponsePromise} from './ResponsePromise';

type RequestFn = (method: HttpVerb, url: string, options?: Options) => ResponsePromise;

export {RequestFn};
