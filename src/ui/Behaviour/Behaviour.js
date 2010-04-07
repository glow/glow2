Glow.provide(function(glow) {
	/**
		@name glow.ui.Behaviour
		@class
		@extends glow.events.Target
		@description Abstract behaviour class.
		@param {string} name The name of this widget.
		This is added to class names in the generated DOM nodes that wrap the widget interface.
		
	*/
	function Behaviour() {}
	glow.util.extend(Behaviour, glow.events.Target);
	
	/*!debug*/
		/**
			@name glow.ui.Behaviour#enabled
			@function
			@description Get/set the enabled state
				
			@param {boolean} [state=true] 
		*/
		Behaviour.prototype.enabled = function() {
			throw new Error('#enabled not implemented on behaviour');
		}
		
		/**
			@name glow.ui.Behaviour#destroy
			@function
			@description Removes the behaviour & event listeners
		*/
		Behaviour.prototype.destroy = function() {
			throw new Error('#destroy not implemented on behaviour');
		}
		
	/*gubed!*/
	
	// EXPORT
	glow.ui.Behaviour = Behaviour;
});