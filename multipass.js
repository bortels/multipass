#!/usr/bin/env node

// Opinionated port multiplexing
// Run me, and I'll listen on 80, and proxy to internal ports based on the Host: header
// Think of this as SNI for http, or virtual hosts for real servers

// If you run me as root, you're a fool. See the README

var configFile = "multipass.json";
var port = 80;
var address = '0.0.0.0';
var fs = require('fs');

var config = { };
if (fs.existsSync(configFile)) {
   config = JSON.parse(fs.readFileSync(configFile));
} else {
   config = JSON.parse('{ "port": 80 }');
}

var bouncy = require('bouncy');
var server = bouncy(function (req, res, bounce) {
    var host = (req.headers.host || '').replace(/:\d+$/, '');
    var route = config[host] || config[''];
    var opt =  { headers : { 'X-Forwarded-For' : req.connection.remoteAddress || req.socket.remoteAddress } };

    if (Array.isArray(route)) {
        // jump to a random route on arrays
        route = route[Math.floor(Math.random() * route.length)];
    }

    req.on('error', onerror);
    function onerror (err) {
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end(String(err) + '\r\n');
    }

    if (typeof route === 'string') {
        var s = route.split(':');
        var b = s[1]
            ? bounce(s[0], s[1], opt)
            : bounce(s, opt)
        ;
        b.on('error', onerror);
    }
    else if (route) {
        bounce(route, opt).on('error', onerror);
    }
    else {
        res.statusCode = 404;
        res.setHeader('content-type', 'text/plain');
        res.write('host not found\r\n');
        res.end();
    }
}).listen(port, address);
