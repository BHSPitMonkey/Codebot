Codebase.com IRC Notifier Bot
=============================

For codebasehq.com projects
http://github.com/BHSPitMonkey/Codebot

Requires:
---------

* Node.JS (http://nodejs.org)
* Jerk (http://github.com/gf3/Jerk)

How to run:
-----------

To start, just run the following command:

    node <path to this file>

Release Notes:
--------------

This would be better with some HTTP authentication
(since Codebase supports using HTTP Basic auth), but,
since I didn't know how to use Basic auth with the node
HTTP module, this server will accept requests from anyone.

Codebase setup:
---------------

In your Codebase notification center, use the HTTP JSON Post
delivery method, and for the server name specify the IP
address or DNS name of this server, followed by the port
you chose below, followed by "/notify".  Here's an example:

> http://myserver.com:1234/notify 

(assuming this server is at myserver.com, and you chose port 1234
in the options below).

License and credit:
-------------------

This script was written by
Stephen Eisenhauer (http://stepheneisenhauer.com), and is
released into the public domain.
