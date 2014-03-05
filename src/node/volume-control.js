var child = require('child_process');

exports.VolumeControl = function() {

    var ctx = this;
    var stop = false;

    this.mute = function() {
	amixer = child.spawn('amixer', ['-M', 'set', 'PCM', '0%']);
	amixer.stderr.on('data', print_output);
	amixer.stdout.on('data', print_output);
    }

    this.volume_up = function() {
	amixer = child.spawn('amixer', ['-M', 'set', 'PCM', '10%+']);
	amixer.stderr.on('data', print_output);
	amixer.stdout.on('data', print_output);
    }

    this.volume_down = function() {
	amixer = child.spawn('amixer', ['-M', 'set', 'PCM', '10%-']);
	amixer.stderr.on('data', print_output);
	amixer.stdout.on('data', print_output);
    }

    function print_output(data) {
	console.log("amixer: " + data);
    }
}

