multipass
=========

Opinionated http(s) port multiplexer
------------------------------------

This is really just a wrapper around bouncy; I add a few things:

* X-Forwarded-For headers added
* a simple way to edit the config on-the-fly 

### Usage: ###

Check out the repo, run "npm install" to fetch the dependencies. 

Edit multipass.js if the default port of 80 doesn't work for you. 

Run "node multipass.js". Note that to bind to port 80, you may be
tempted to run as root. Please - don't. There are ways to bind to
80 without being root - authbind is my favorite, or you can use
ipfw to forward 80 to a port higher than 1024. Google it!

You probably will want to run this under forever or pm2. 

### Configuration: ###

The config file is pure bouncy - a simple json collection of strings
to match to the "Host:" header, and the destination to connect it to
(usually another port on localhost). Note that "" is the default route
in case there is no host header that matches (or at all).

You will notice there's a key there that's got "config" as the destination;
that's the way you can talk to multipass itself, by POSTing data to it.

An example is worth a thousand words - you can use curl to talk to it:

```bash
curl -H "Host: config.whatever" -X POST http://localhost:80 -d "COMMAND"
```

where config.whatever is the config route in the json config,
and COMMAND is one of the following:

| COMMAND              | WHAT IT DOES                                   |
| -------------------- | ---------------------------------------------- |
| list                 | Shows the running configuration                |
| save                 | Saves the running configuration to disk        |
| add HOST DESTINATION | Adds an entry for HOST pointing to DESTINATION |
| del HOST             | Deletest the entry for HOST                    |

### A note on pronunciation: ###

The cool kids pronounce it "mool-tee-pahss".
If you never saw "The Fifth Element" - go see it.
