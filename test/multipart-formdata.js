'use strict';

var FormData = require('form-data');
var https = require('https');
var request = require('../');

https.get("https://nodejs.org/static/images/logos/nodejs-new-pantone-black.png", function (res) {
    // https://www.npmjs.com/package/form-data
    request("POST", "https://sm.ms/api/upload", {
        form: {
            smfile: {value: res, options: {}},
            test: "test value"
        }
    }).done(res => {
        // {"code":"success","data":{"width":1843,"height":1129,"filename":"nodejs-new-pantone-black.png","storename":"58a6ebef4e499.png","size":46753,"path":"\/2017\/02\/17\/58a6ebef4e499.png","hash":"qvoj7Pz9yQRFhCw","timestamp":1487334383,"ip":"49.74.124.189","url":"https:\/\/ooo.0o0.ooo\/2017\/02\/17\/58a6ebef4e499.png","delete":"https:\/\/sm.ms\/api\/delete\/qvoj7Pz9yQRFhCw"}}
        console.log(res.getBody().toString())
    })


    /* pure body data */
    // form.append('smfile', res);
    // form.on('data', (chunk) => {
    //     if (typeof chunk === 'string') {
    //         chunk = new Buffer(chunk);
    //     }
    //     console.log(chunk.toString())
    //     chunks.push(chunk);
    // });
    //
    // form.on('end', () => {
    //     request("POST", "https://sm.ms/api/upload", {body: Buffer.concat(chunks), headers}).done((res) => {
    //         console.log(res.getBody().toString());
    //     })
    // });
    // form.resume();
})




