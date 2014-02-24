multipass
=========

Opinionated http(s) port multiplexer

This is really just a wrapper around bouncy; we add a few things:
1) X-Forwarded-For
2) a simple way to edit the config on-the-fly (under construction)

Usage:

If your incoming port is >1024 - good on you. Modify multipass to have your port, edit the config (it's basically the same as bouncy, pairs of Host: names and ports to proxy to, as json), and party on.

If not - you can run multipass as root if you're a damn fool. Not that I believe it's vulnerable, just that
there's no good reason to other than being able to open port 80, and there's plenty of ways to do that without
being root.

The best way, IMHO, is authbind. Details to follow here shortly. 

On recent linux (kernel 2.6.24 or later - that's rhel/centos 6) - you can use "setcap" as follows:

setcap 'cap_net_bind_service=+ep' /path/to/program

/path/to/program in this case is node - keep in mind if you do this, node programs in general will be able to
open ports less than 1025.

Other options are to mess with firewall rules, use nc to forward the port (but now nc is running as root).
