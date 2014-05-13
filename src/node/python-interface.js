var net = require('net');

exports.PythonBridge = function(port) {
	
	var sock = null;
	var ready = false;

	this.connect = function(incoming_callback) {
		sock = net.connect({"port": port}, function() {
			console.log("Python bridge connected");
			ready = true;
		});
		sock.on('data', function(data) {
			console.log("Python bridge incoming data: " + data);
			incoming_callback(data);
		});
		sock.on('end', function() {
			console.log("Python bridge disconnected")
			ready = false;
		});
	};

	this.send_command = function(cmd) {
		if (ready) {
			sock.write(cmd + "\r\n");
		}
	};
}
