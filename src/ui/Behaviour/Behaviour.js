Glow.provide(function(glow) {
	var BehaviourProto, undefined;
	
	/**
		@name glow.ui.Behaviour
		@class
		@extends glow.events.Target
		@description Abstract behaviour class.
		@param {string} name The name of this widget.
		This is added to class names in the generated DOM nodes that wrap the widget interface.
		
	*/
	function Behaviour() {}
	
	/**
		@name glow.ui.Behaviour#container
		@type glow.NodeList
		@description The element the behaviour is acting on
	*/
	
	/**
		@name glow.ui.Behaviour#disable
		@function
		@description Sets the disabled property of this behaviour to true and fires the disable event
		
		@param {boolean} [state=true] 
		@see glow.ui.Widget#enable
	*/
	
	/**
		@name glow.ui.Behaviour#destroy
		@function
		@description Removes the behaviour & event listeners
	*/
	
	// EXPORT
	glow.ui.Behaviour = Behaviour;
});