// cross-browser debugging console
window.log = {};

log._add = function(msg, level) {
	if (!log.window) {
		log.window = window.open('', 'report', 'width=350,height=250,menubar=0,toolbar=0,location=no,status=0,scrollbars=1,resizable=1');
		log.window.document.write(
			'<html><head><title>Console<\/title><style>.message{padding:4px;margin:0px;border-bottom:1px solid #ccc;} .warn {background-color: #E5E6B6;} .error{background-color: #D39C9E;}<\/style><\/head>'
			+ '<body style="font: 11px monaco"><code id="messages"><\/code><\/body><\/html>'
		)
		log.window.document.close();
	}
	
	if (log.window) {
		var output = log.window.document.createElement('P');
		output.className = 'message ' + level;
		output.innerHTML = msg;
		log.window.document.getElementById('messages').appendChild(output);
	}
}

log.info = function(msg) { log._add(msg, 'info'); }
log.warn = function(msg) { log._add(msg, 'warn'); }
log.error = function(msg) { log._add(msg, 'error'); }