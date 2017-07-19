const JSDOM = require('jsdom').JSDOM;
const dom = new JSDOM('', {url: 'http://localhost:3000'});

exports.enable = function enable() {
  global.window = dom.window;
  global.XMLHttpRequest = dom.window.XMLHttpRequest;
  global.location = dom.window.location;
  global.FormData = dom.window.FormData;
}
exports.disable = function disable() {
  delete global.window;
  delete global.XMLHttpRequest;
  delete global.location;
  delete global.FormData;
}