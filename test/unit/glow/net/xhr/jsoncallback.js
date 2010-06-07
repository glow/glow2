(function() {
//this is really really dirty
var lastScript = document.getElementsByTagName('head')[0].firstChild;
if (lastScript.nodeName.toLowerCase() != "script") {
	alert('jsoncallback.js: script element not found');
}
var callbackName = /callback=([^&]+)/.exec(lastScript.src)[1];
eval(callbackName + '({hello:"world"});');
})();