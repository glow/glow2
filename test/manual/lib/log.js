// defines global log function
(function () {
	// see http://log4js.berlios.de/docu/users-guide.html
	var log4jsLog,
		logOutputElementId = "log-messages"; // add this to your page
	
	if (logOutputElementId) { // in-page log
		log4jsLog = log4javascript.getLogger("main");
		log4jsLog.addAppender(new log4javascript.InPageAppender(logOutputElementId));
	}
	else { // use pop-up window
		log4jsLog = log4javascript.getDefaultLogger();
	}
	
	// exports
	window.logger = log4jsLog;
})();