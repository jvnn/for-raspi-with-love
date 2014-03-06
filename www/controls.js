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

function controlPressed(action) {
    switch(action) {
    case 'stop':
	makeAjaxCall('control?cmd=music&params=stop');
	break;
    case 'play':
	makeAjaxCall('control?cmd=music&params=play');
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
    case 'shutdown':
	makeAjaxCall('control?cmd=shutdown');
	break;
    }
}
    
