var glowbug = {
	errors: []
	,
	log: function(message, fileName, lineNumber) {
		this._add('Log', message, fileName, lineNumber);
	}
	,
	warn: function(message, fileName, lineNumber) {
		this._add('Warn', message, fileName, lineNumber);
	}
	,
	error: function(message, fileName, lineNumber) {
		this._add('Error', message, fileName, lineNumber);
	}
	,
	_add: function(level, message, fileName, lineNumber) {
		var e = new Error(message, fileName, lineNumber);
		
		e.message = message;
		e.name = 'Glow'+level;
		e.level = level.toLowerCase();
		
		var match = /\[([^\]]+)\]/.exec(message);
		if (match) e.type = match[1]; // may be undefined
		else e.type = 'message';
		
		this.errors.push(e);
		
		this.out(e);
	}
	,
	out: function(e) {
		var message = '['+e.level+'] '+e.message;
		
		if (window.console) {
			if (e.level === 'warn' && window.console.warn) {
				console.warn(message);
			}
			else if (e.level === 'error' && window.console.error) {
				console.error(message);
			}
			else if (window.console.log) {
				console.log(message);
			}
		}
		else if (window.opera && opera.postError) {
			opera.postError(message);
		}
		else { // use our own console
			glowbug.console.log(e.level, message);
		}
	}
};

glowbug.console = {
	messages: [],
	log: function(level, message) {
		if (!this._w) {
			try {
				this._w = window.open('', 'report', 'width=350,height=250,menubar=0,toolbar=0,location=no,status=0,scrollbars=1,resizable=1');
				this._w.document.write(
					'<html><head><title>Console<\/title><style>body{background-color: #ddd;} .message{background-color:#FFF;padding:4px;margin:0px;border-bottom:1px solid #ccc;} .warn {background-color: #E5E6B6;} .error{background-color: #D39C9E;}<\/style><\/head>'
					+ '<body style="font: 11px monaco"><code id="messages"><\/code><\/body><\/html>'
				)
				this._w.document.close();
			}
			catch(ignored) {
				this._w = null;
			}
		}
		
		if (this._w) {
			var p = this._w.document.createElement('P');
			p.className = 'message ' + level;
			p.innerHTML = message;
			this._w.document.getElementById('messages').appendChild(p);
			
			var dh = this._w.document.body.scrollHeight
			var ch = this._w.document.body.clientHeight
			if (dh > ch) { this._w.scrollTo(0, dh-ch); }
		}
	}
}