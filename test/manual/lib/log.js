// defines global log function
(function () {
	var log4jsLog,
		logOutputElementId = "log-messages";
	
	if (logOutputElementId) { // in-page log
		log4jsLog = log4javascript.getLogger("main");
		log4jsLog.addAppender(new log4javascript.InPageAppender(logOutputElementId));
	}
	else { // use pop-up window
		log4jsLog = log4javascript.getDefaultLogger();
	}
	
	// exports
	window.log = log4jsLog;
})();