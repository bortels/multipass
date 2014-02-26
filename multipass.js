#!/usr/bin/env node

// Opinionated port multiplexing
// Run me, and I'll listen on 80, and proxy to internal ports based on the Host: header
// Think of this as SNI for http, or virtual hosts for real servers

// If you run me as root, you're a fool. See the README

var configFile = "multipass.json";
var port = 80;
var address = '0.0.0.0';
var fs = require('fs');

var config = JSON.parse(fs.readFileSync(configFile));

var bouncy = require('bouncy');
var server = bouncy(function (req, res, bounce) {
    var host = (req.headers.host || '').replace(/:\d+$/, '');
    var route = config[host] || config[''];
    var opt =  { headers : { 'X-Forwarded-For' : req.connection.remoteAddress || req.socket.remoteAddress } };

    function doconfig (data) {
      var d = String.fromCharCode.apply(null, new Uint16Array(data)); // jebus, gotta be a nicer way
      var ds = d.toLowerCase().split(/\s+/);
      var cmd = ds.shift();
      var key = ds.shift();
      var dest = ds.shift();
      res.statuscode = 404;
      var result = "Unknown Command";
      if (cmd == "add") { // or replace, I guess...
         config[key] = dest;
         res.statusCode = 200;
         result = "Added " + key + " => " + dest;
      }  
      if (cmd == "del") {
         if (typeof config[key] != "undefined") {
            config[key] = undefined;
            res.statuscode=200;
            result = "Deleted " + key;
         } else {
            result = "Not Found"; 
         }
      }
      if (cmd == "list") {
         res.statuscode=200;
         result = JSON.stringify(config, null, 2);
      }
      if (cmd == "save") {
         res.statuscode=200;
         result = "Saved";
         try { fs.writeFileSync(configFile, JSON.stringify(config, null, 2)); } // yes, synchronous. Sorry.
         catch (e) {
            res.statuscode=403; // guessing
            result = "Write Failed"; 
            }
      }
      res.setHeader('content-type', 'text/plain');
      res.end(result + '\r\n');
    }

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
        if (route == 'config') {
           req.on('data', doconfig);
        } else {
           b.on('error', onerror);
        }
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
