var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var util = require('util');
var child = require('child_process');
var io = require('socket.io');
var vol = require('./volume-control.js');
var ruby = require('./ruby-interface.js');

if (process.argv.length != 3) {
	console.log("Usage: node web-interface.js <web_root_dir>");
	console.log("(process.argv now: " + process.argv + ")");
	process.exit(1);
}
var WEB_ROOT = process.argv[2]
var volume = new vol.VolumeControl();


var server = http.createServer(function(req, res) {
	pathname = url.parse(req.url).pathname;

	console.log('Received request for: ' + pathname);
	/* ajax interfaces first */
	if (pathname == '/control') {
		query = url.parse(req.url, true).query;
		doControl(query['cmd'], query['params']);
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('OK');
		return;
	}

	full_path = WEB_ROOT + pathname;

	/* filter out paths that try to go beyond the web root */
	if (full_path.indexOf("..") != -1) {
		res.writeHead(404);
		res.end();
	}

	if (pathname == '/') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(fs.readFileSync(full_path + 'index.html'));
	} else if (fs.existsSync(full_path) && fs.statSync(full_path).isFile()) {
		var mime_type = "text/plain";
		switch(path.extname(pathname)) {
		case '.html':
			mime_type = 'text/html';
			break;
		case '.jpg':
			mime_type = 'image/jpeg';
			break;
		case '.png':
			mime_type = 'image/png';
			break;
		case '.css':
			mime_type = 'text/css';
			break;
		}
		
		res.writeHead(200, {'Content-Type': mime_type});
		res.end(fs.readFileSync(full_path));
	} else {
		res.writeHead(404);
		res.end();
	}
});

server.listen(8080);


function doControl(cmd, params) {
	switch(cmd) {
	case 'music':
		ruby_bridge.send_command(util.format("%s %s", cmd, params));
		break;
	case 'volume':
		switch(params) {
		case 'down':
			volume.volume_down();
			break;
		case 'up':
			volume.volume_up();
			break;
		case 'mute':
			volume.mute();
			break;
		default:
			console.log('Invalid parameters for volume: ' + params);
		}
		break;
	case 'shutdown':
		child.spawn('sudo', ['shutdown', '-P', 'now']);
		break;
	default:
		console.log('Invalid command: ' + cmd);
	}
}

var push_socket = io.listen(server);
var out_socket = null;
push_socket.on('connection', function(client) {
	out_socket = client;
});

var ruby_bridge = new ruby.RubyBridge(8989);
ruby_bridge.connect(function(data) {
	if (out_socket != null) {
		contents = data.toString().split(':', 2);
		if (contents.length != 2) {
			console.log('Invalid data from ruby bridge: ' + data);
			return;
		}
		out_socket.emit(contents[0], contents[1]);
	}
});
