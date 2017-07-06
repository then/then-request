const JSDOM = require('jsdom').JSDOM;
const dom = new JSDOM('', {url: 'http://localhost:3000'});

global.window = dom.window;
global.XMLHttpRequest = dom.window.XMLHttpRequest;
global.location = dom.window.location;