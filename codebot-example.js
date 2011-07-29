/*
 * Codebase.com IRC Notifier Bot
 * For codebasehq.com projects
 * http://github.com/BHSPitMonkey/Codebot
 *
 * Requires:
 * Node.JS (http://nodejs.org)
 * Jerk (http://github.com/gf3/Jerk)
 *
 * How to run:
 * To start, just run the following command:
 * node <path to this file>
 * 
 * Release Notes:
 * This would be better with some HTTP authentication
 * (since Codebase supports using HTTP Basic auth), but
 * since I didn't know how to use Basic auth with the node
 * HTTP module, this server will accept requests from anyone.
 * 
 * Codebase setup:
 * In your Codebase notification center, use the HTTP JSON Post
 * delivery method, and for the server name specify the IP
 * address or DNS name of this server, followed by the port
 * you chose below, followed by "/notify".  Here's an example:
 * http://myserver.com:1234/notify 
 * (assuming this server is at myserver.com, and you chose port 1234
 * in the options below).
 * 
 * License and credit:
 * This script was written by
 * Stephen Eisenhauer (stepheneisenhauer.com), and is
 * released into the public domain.
*/

/////////////////
//   OPTIONS   //
/////////////////

// Server options (set up which port to listen for notifications on)
server_port = 9999;	// you should pick an unusual port to use

// Codebase account options
codebase_version = 4;	// can be 3 or 4, depending on your account

// IRC options (set up which IRC server/channels to connect to, and the nickname)
var options =
	{ server: 'irc.freenode.net'
	, nick: 'Codebot'
	, channels: ['#codebot']
	}

// Codebase-to-IRC options (define which projects' events are announced in which channels)
// Note: The bot can only send announcements to channels it is in, so make sure to add
// desired channels to the IRC options above!
var projects_channels = 
	{	"Codebase": ['#codebot']
	,	"Widgets": ['#codebot','#codebot-widgets']
	}
// If you want projects unspecified above to go into a particular channel, set it here
// Example: var default_channel = "#codebot";
var default_channel;

///////////////////
//  SCRIPT CODE  //
///////////////////

var jerk = require('jerk');

// IRC bot client
var bot = jerk(function(j) {

  // Here you can define additional triggers/commands for the bot
  /*  
  j.watch_for('soup', function(message) {
    message.say(message.user + ': I like soup!')
  })

  j.watch_for(/^(.+) are silly$/, function(message) {
    message.say(message.user + ': ' + message.match_data[1] + ' are NOT SILLY. Don\'t joke!')
  })
  */
}).connect(options);

// Generates a bold IRC string
function boldString(str) {
	return String.fromCharCode(2) + str + String.fromCharCode(2);
}

// Parses a codebase JSON notification object and returns needed info
function parseV3Notification(jsonobj) {
	var proj;
	var msg;
	switch (jsonobj["type"]) {
		case 'new_ticket':
			proj = jsonobj["payload"]["project"]["name"];
			msg = boldString("New ticket") +
				" #" + jsonobj["payload"]["id"] +
				" created by " + boldString(jsonobj["payload"]["reporter"]["username"]) +
				" in " + boldString(jsonobj["payload"]["project"]["name"]) +
				': "' + jsonobj["payload"]["summary"] +
				'"';
			break;
		case 'update_ticket':
			proj = jsonobj["payload"]["ticket"]["project"]["name"];
			msg = boldString("Ticket #" + jsonobj["payload"]["ticket"]["id"]) +
				" (" + jsonobj["payload"]["ticket"]["summary"] +
				") " + boldString("updated") +
				" by " + boldString(jsonobj["payload"]["user"]["username"]) +
				" in " + boldString(jsonobj["payload"]["ticket"]["project"]["name"]) +
				': "' + jsonobj["payload"]["content"] +
				'"';
			break;
		case 'push':
			proj = jsonobj["payload"]["repository"]["project"]["name"];
			msg = "User " + 
				boldString(jsonobj["payload"]["user"]["username"] + " pushed") +
				" to " + boldString(jsonobj["payload"]["repository"]["name"]) +
				" in " + boldString(jsonobj["payload"]["repository"]["project"]["name"]) +
				": ";
			if (jsonobj["payload"]["commits"].length == 1) {
				msg += jsonobj["payload"]["commits"][0]["message"];
			}
			else {
				msg += "" + jsonobj["payload"]["commits"].length + " commits";
			}
			break;
		
		default:
			break;
	}
	return {'proj':proj, 'msg',msg};
}
function parseV4Notification(jsonobj) {
	var proj;
	var msg;
	var payload = jsonobj['payload'];
	
	// If this is a commit notification
	if (payload && payload['commits'] && payload['commits'].length > 0) {
		proj = payload['repository']['project']['name'];
		msg = "User " +
			boldString(payload['user']['username'] + " pushed") +
			" to " + boldString(jsonobj["payload"]["repository"]["name"]) +
			" in " + boldString(jsonobj["payload"]["repository"]["project"]["name"]) +
			": ";
		if (payload['commits'].length == 1)
			msg += payload['commits'][0]['message'];
		else
			msg += "" + payload['commits'].length + " commits";
	}
	
	// If this is a ticket notification: TODO
	
	return {proj:proj, msg:msg};
}

// Set up the HTTP server
var http = require('http'), 
url = require('url');
var server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	switch (path){
		case '/notify':
			var jsondata = "";
			req.addListener('data', function(chunk) {
				jsondata += chunk;
			});
			req.addListener('end', function() {
				try {
					// console.log('Unescaped: ' + unescape(jsondata));
					var unescaped = unescape(jsondata);
					unescaped = '{' + unescaped + '}';
					unescaped = unescaped.replace(new RegExp('([a-zA-Z]+)=', 'g'), '"$1":');	// once for the payload
					unescaped = unescaped.replace('};', '},');
					var jsonobj = JSON.parse(unescaped);
					// console.log('Got JSON object: ' + JSON.stringify(jsonobj, null, 2));
					res.writeHead(200);
					res.end();
					
					// Figure out notification details
					var details;
					if (codebase_version == 3)
						details = parseV3Notification(jsonobj);
					else
						details = parseV4Notification(jsonobj);

					// Figure out channels
					var destchans = [];
					if (details['proj']) {
						destchans = projects_channels[details['proj']];
						// If this project wasn't defined in the options
						if (!destchans) {
							// Make destchans an empty array, or an array
							// containing the default_channel if set.
							destchans = (default_channel) ? [default_channel] : [];
						}
					}

					// If we have what we need, go ahead and say the message
					if ((destchans.length > 0) && details['msg'])
						for (var i=0; i<destchans.length; i++)
							bot.say(destchans[i], details['msg']);
				}
				catch (e) {
					console.log('Encountered exception while receiving data from CodeBase: ' + e);
					console.log('Description of error: ' + e.message);
					console.log('Trace: ' + e.stack);
				}
			});

			break;
			
		default:
			res.writeHead(404);
			res.end();
	}
});
server.listen(server_port);
console.log('HTTP server should be listening.');
