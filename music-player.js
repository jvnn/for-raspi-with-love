var child = require('child_process');
var fs = require('fs');
var path = require('path');

//var pl = new Player('/home/jivi/Music');
//pl.start_random_play();

exports.Player = function(music_dir) {

    var dir = music_dir;
    var gst_player = null;
    var files = find_music_files(music_dir, []);
    var ctx = this;
    var stop = false;

    this.start_random_play = function() {
	rand = Math.random();
	if (rand == 1.0) {
	    rand -= 0.001;
	}
	idx = Math.floor(rand*files.length);
	play_song(files[idx]);
    }

    this.stop_playback = function() {
	if (gst_player != null) {
	    stop = true;
	    gst_player.kill();
	}
    }

    this.next_song = function() {
	ctx.stop_playback();
	ctx.start_random_play();
    }

    function play_song(path) {
	gst_player = child.spawn('gst-launch-0.10', ['-q', 'playbin', 'uri=file://'+path]);

	gst_player.stdout.on('data', function (data) {
	    console.log('stdout: ' + data);
	});

	/* gst_player.stderr.on('data', function (data) {
	   console.log('stderr: ' + data);
	   }); */

	gst_player.on('close', function (code) {
	    if (!stop) {
		ctx.start_random_play();
	    } else {
		stop = false;
	    }
	});
    }


    function find_music_files(path_to_check, files) {
	stats = fs.statSync(path_to_check);
	if (stats.isFile()) {
	    // termination condition: it's a single file
	    return files.push(path_to_check);
	}
	// otherwise it's a directory
	new_paths = fs.readdirSync(path_to_check)
	for (p in new_paths) {
	    // paths in "new_paths" are just the final end names.
	    // make them full paths for the new call.
	    find_music_files(path.join(path_to_check, new_paths[p]), files);
	}
	return files;
    }
}

