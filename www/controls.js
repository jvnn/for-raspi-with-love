socket = io.connect();
socket.on('song', function(data){
	document.getElementById('current_song').innerHTML = data;
});

var source = 'local';	

function makeAjaxCall(url, listener) {
    var req = new XMLHttpRequest();
    req.open('get', url);
    req.onreadystatechange = function() {
		if (req.readyState == 4) {
			listener(req.responseText);
		}
    };
    req.send();
}

function changeSource(src) {
	source = src;
	document.getElementById('source_local_btn').classList.toggle('active');
	document.getElementById('source_radio_btn').classList.toggle('active');
}

function controlPressed(action) {
    switch(action) {
    case 'stop':
		makeAjaxCall('control?cmd=music&params=stop');
		break;
    case 'play':
		if (source == 'local') {
			makeAjaxCall('control?cmd=music&params=play');
		} else if (source == 'radio') {
			makeAjaxCall('control?cmd=music&params=radio');
		} else {
			console.log('Cannot start playing, invalid source: ' + source);
		}
		break;
    case 'next':
		makeAjaxCall('control?cmd=music&params=next');
		break;
    case 'minus':
		makeAjaxCall('control?cmd=volume&params=down');
		break;
    case 'mute':
		makeAjaxCall('control?cmd=volume&params=mute');
		break;
    case 'plus':
		makeAjaxCall('control?cmd=volume&params=up');
		break;
	default:
		console.log('Invalid action for controlPressed: ' + action);
    }
}

function openDialog(dialog_id) {
	dialog = document.getElementById(dialog_id);
	if (dialog != null) {
		dialog.style.display = 'block';
	}
}
    
function closeDialog(dialog_id) {
	dialog = document.getElementById(dialog_id);
	if (dialog != null) {
		dialog.style.display = 'none';
	}
}
