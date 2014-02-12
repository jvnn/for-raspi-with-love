var net = require('net');
var music_player = require('./music-player.js');
var volume_control = require('./volume-control.js');

var PORT = 8989;

net.createServer(function(sock) {
    console.log("Connected: " + sock.remoteAddress);

    sock.setEncoding('utf-8');
    sock.on('data', parseCommand);
    

}).listen(PORT);

var music = new music_player.Player('/home/jivi/Music');
var volume = new volume_control.VolumeControl();

function parseCommand(cmd) {
    cmds = cmd.trim().split(' ');
    if (cmds.length < 2) {
	console.log("Invalid command (too short): " + cmd);
	return;
    }

    switch (cmds[0]) {
    case "music":
	switch (cmds[1]) {
	case "play":
	    music.start_random_play();
	    break;
	case "stop":
	    music.stop_playback();
	    break;
	case "next":
	    music.next_song();
	    break;
	default:
	    console.log("Invalid music command: " + cmd);
	}
	break;
	
    case "volume":
	switch (cmds[1]) {
	case "mute":
	    volume.mute();
	    break;
	case "down":
	    volume.volume_down();
	    break;
	case "up":
	    volume.volume_up();
	    break;
	default:
	    console.log("Invalid volume command: " + cmd);
	}
	break;

    default:
	console.log("Invalid primary command: " + cmd);
    }
}
