/**
	@name glow.net
	@namespace
	@description Methods for getting data & resources from other locations. Sometimes referred to as AJAX.
*/
Glow.provide(function(glow) {
	var net = {},
		undefined,
		emptyFunc = function(){};
	
	/**
		@private
		@function
		@description Create XhrRequest factory methods
		
		@param {string} method HTTP method
		@returns {function} Factory method
	*/
	function createXhrFactory(method) {
		return function(url, data, opts) {
			// only put & post use the data param
			if (method === 'POST' || method === 'PUT') {
				opts = opts || {};
				opts.data = data;
			}
			else {
				opts = data;
			}
			
			return new net.XhrRequest(method, url, opts);
		}
	}
	
	/**
		@name glow.net.get
		@function
		@description Makes an HTTP GET request to a given url.
			This is a shortcut to creating an instance of {@link glow.net.XhrRequest}.
	 
		@param {string} url Url to make the request to.
			This can be a relative path. You cannot make requests for files on
			other domains (including sub-domains). For cross-domain requests, see
			{@link glow.dom.getJsonp} and {@link glow.dom.crossDomainGet}.
		@param {Object} [opts] Options.
			These options are the same as the constructor options for {@link glow.net.XhrRequest}.
	 
		@returns {glow.net.XhrRequest}
	 
		@example
			glow.net.get('myFile.html').on('load', function(response){
				alert( 'Got file:' + response.text() );
			}).on('error', function(response){
				alert( 'Something went wrong:' + response.text() );
			});
			
	*/
	net.get = createXhrFactory('GET');
	
	/**
		@name glow.net.post
		@function
		@description Makes an HTTP POST request to a given url
			This is a shortcut to creating an instance of {@link glow.net.XhrRequest}.
		 
		@param {string} url Url to make the request to.
			This can be a relative path. You cannot make requests for files on
			other domains (including sub-domains). For cross-domain requests, see
			{@link glow.dom.getJsonp} and {@link glow.dom.crossDomainGet}.
		@param {Object|String} data Data to send.
			This can be either a JSON-style object or a urlEncoded string.
		@param {Object} [opts] Options.
			These options are the same as the constructor options for {@link glow.net.XhrRequest}.
		
		@returns {glow.net.XhrRequest}
	 
		@example
			glow.net.post('myFile.html', {
				key: 'value',
				otherkey: ['value1', 'value2']
			}).on('load', function(response) {
				alert( 'Got file:' + response.text() );
			});
	*/
	net.post = createXhrFactory('POST');
	
	/**
		@name glow.net.put
		@function
		@description Makes an HTTP PUT request to a given url
			This is a shortcut to creating an instance of {@link glow.net.XhrRequest}.
		 
		@param {string} url Url to make the request to.
			This can be a relative path. You cannot make requests for files on
			other domains (including sub-domains). For cross-domain requests, see
			{@link glow.dom.getJsonp} and {@link glow.dom.crossDomainGet}.
		@param {Object|String} data Data to send.
			This can be either a JSON-style object or a urlEncoded string.
		@param {Object} [opts] Options.
			These options are the same as the constructor options for {@link glow.net.XhrRequest}.
 
		@returns {glow.net.XhrRequest}
 
		@example
			glow.net.put('myFile.html', {
				key: 'value',
				otherkey: ['value1', 'value2']
			}).on('load', function(response) {
				// handle response
			});
	*/
	net.put = createXhrFactory('PUT');
	
	/**
		@name glow.net.del
		@function
		@description Makes an HTTP DELETE request to a given url.
			This is a shortcut to creating an instance of {@link glow.net.XhrRequest}.
		 
		@param {string} url Url to make the request to.
			This can be a relative path. You cannot make requests for files on
			other domains (including sub-domains). For cross-domain requests, see
			{@link glow.dom.getJsonp} and {@link glow.dom.crossDomainGet}.
		@param {Object} [opts] Options.
			These options are the same as the constructor options for {@link glow.net.XhrRequest}.
 
		@returns {glow.net.XhrRequest}
 
		@example
			glow.net.del('myFile.html').on('load', function(response) {
				// handle response
			});
	*/
	
	net.del = createXhrFactory('DELETE');		
		
	// export
	glow.net = net;
});