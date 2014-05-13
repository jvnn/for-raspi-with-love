socket = io.connect();

socket.on('song', function(data){
	document.getElementById('current_song').innerHTML = data;
});

socket.on('stations', function(data){
	showRadioStations(data.split('\n'));
});


window.onload = function() {
	makeAjaxCall('query?req=song');
}


var source = 'local';	

function makeAjaxCall(url, listener) {
    var req = new XMLHttpRequest();
    req.open('get', url);
    req.onreadystatechange = function() {
		if (req.readyState == 4 && listener != null) {
			listener(req.responseText);
		}
    };
    req.send();
}

function changeSource(src) {
	source = src;
	document.getElementById('source_local_btn').classList.toggle('active');
	document.getElementById('source_radio_btn').classList.toggle('active');
	if (source == 'radio') {
		makeAjaxCall('query?req=stations');
	} else {
		clearRadioStations();
	}
}

function controlPressed(action) {
    switch(action) {
    case 'stop':
		makeAjaxCall('control?cmd=music&params=stop');
		break;
    case 'play':
		if (source == 'local') {
			makeAjaxCall('control?cmd=music&params=play');
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

function showRadioStations(stations) {
	slot = document.getElementById('radio_stations');
	markup = '';
	for (i = 0; i < stations.length; i++) {
		markup += '<div class="radio_station" onclick="tuneToStation(\'' +
			stations[i] + '\')">' + stations[i] + '</div>';
	}
	slot.innerHTML = markup;

	play_btn = document.getElementById('play_button');
	next_btn = document.getElementById('next_button');
	play_btn.classList.add('disabled');
	next_btn.classList.add('disabled');
	play_btn.onclick = null;
	next_btn.onclick = null;
}

function clearRadioStations() {
	document.getElementById('radio_stations').innerHTML = '';
	play_btn = document.getElementById('play_button');
	next_btn = document.getElementById('next_button');
	play_btn.classList.remove('disabled');
	next_btn.classList.remove('disabled');
	play_btn.onclick = function() {controlPressed('play');};
	next_btn.onclick = function() {controlPressed('next');};
}

function tuneToStation(station) {
	makeAjaxCall('control?cmd=music&params=radio%20' + station);
}

function initiateShutdown() {
	makeAjaxCall('control?cmd=shutdown');
}
