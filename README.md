Codebase.com IRC Notifier Bot
=============================

For codebasehq.com projects

http://github.com/BHSPitMonkey/Codebot

Requires:
---------

* Node.JS [(homepage)](http://nodejs.org)
* Jerk [(homepage)](http://github.com/gf3/Jerk)

How to set up:
--------------

1. Make a copy of codebot-example.js (for example, to codebot.js)
2. Open your copy in a text editor and configure the settings in the
section labeled "OPTIONS"
3. That's it!

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
Stephen Eisenhauer [(homepage)](http://stepheneisenhauer.com), and is
released into the public domain.
