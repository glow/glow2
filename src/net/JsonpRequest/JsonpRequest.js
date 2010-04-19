Glow.provide(function(glow) {
	Request = glow.net.Request;
		
	/**
		@name glow.net.JsonpRequest
		@class
		@description Returned by {@link glow.net.getResources }
		@glowPrivateConstructor There is no direct constructor, since {@link glow.net.getResources} creates the instances.
	*/
	 
	 
	 // make event shortcuts available (on)
	//glow.util.extend(Request, glow.events.Target);
	
	 
	/**
		@name glow.net.JsonpRequest#event:load
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is sucessful
			For a get / post request, this will be fired when request returns
			with an HTTP code of 2xx. 
	*/
 
	/**
		@name glow.net.JsonpRequest#event:abort
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is aborted
			If you cancel the default (eg, by returning false) the request
			will continue.
		@description Returned by {@link glow.net.post glow.net.post}, {@link glow.net.get glow.net.get} async requests and {@link glow.net.loadScript glow.net.loadScript}
			@see <a href="../furtherinfo/net/net.shtml">Using glow.net</a>
			glowPrivateConstructor There is no direct constructor, since {@link glow.net.post glow.net.post} and {@link glow.net.get glow.net.get} create the instances.
	*/
 
	/**
		@name glow.net.JsonpRequest#event:error
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is unsucessful
			For a get/post request, this will be fired when request returns
			with an HTTP code which isn't 2xx or the request times out. loadScript
			calls will fire 'error' only if the request times out.
	*/


	
	/**
		@name glow.net.JsonpRequest#element
		@description A reference to the script node
		@type {glow.NodeList}
	
	*/
		
});