import Promise = require('promise');
import Response = require('http-response-object');

export declare class ResponsePromise extends Promise<Response<Buffer | string>> {
  getBody(encoding: string): Promise<string>;
  getBody(): Promise<Buffer | string>;
}

function getBody(this: Promise<Response<Buffer | string>>, encoding?: string) {
  if (!encoding) {
    return this.then(getBodyBinary);
  }
  if (encoding === 'utf8') {
    return this.then(getBodyUTF8);
  }
  return this.then(getBodyWithEncoding(encoding));
}
function getBodyWithEncoding(encoding: string): (res: Response<Buffer | string>) => string {
  return res => res.getBody(encoding);
}
function getBodyBinary(res: Response<Buffer | string>): Buffer | string {
  return res.getBody();
}
function getBodyUTF8(res: Response<Buffer | string>): string {
  return res.getBody('utf8');
}

function toResponsePromise(result: Promise<Response<Buffer | string>>): ResponsePromise {
  (result as any).getBody = getBody;
  return (result as any);
}

export default toResponsePromise;
