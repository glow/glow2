Glow.provide(function(glow) {
	var undefined,
		GroupProto;
	
	/**
		@name glow.anim.Group
		@extends glow.events.Target
		@class
		@description Sequence and synchronise multiple animations
			This can be used to easily chain animations together
			and ensure that multiple animations stay in sync
			with each other.
			
		@param {Object} [opts] Options object.
		
		@param {boolean} [opts.loop=true] Loop the animation.
			Looped animation groups will fire a 'complete' event on each loop.
			
			// implementation note: (delete this later)
			this is just a shortcut for setting #loop
			
		@param {boolean} [opts.destroyOnComplete=true] Destroy animations in the group once it completes (unless it loops).
			This will free any DOM references the animations may have created. Once
			the animations are destroyed, the group cannot be started again.
			
		@example
			// play 3 animations one after another
			glow.anim.Group().channel(anim1, anim2, anim3).start();
			
		@example
			// play 2 animations at the same time
			glow.anim.Group()
				.channel(anim1)
				.channel(anim2)
				.start();
			
		@example
			// play 2 animations with a second pause in between
			glow.anim.Group().channel(anim1, 1, anim2).start();
			
		@example
			// Make a 'mexican wave'
			// #waveContainer contains 100 divs absolutely positioned next to each other
			
			var animGroup = glow.anim.Group({
				loop: true
			});
			
			//create a wave up & wave down anim for each div
			var wavingDivs = glow("#waveContainer div").each(function(i) {
				var div = glow(this);
			
				animGroup.channel(
					// add a pause to the start of the anim, this creates the wave effect
					(i / 100),
					// move up
					div.anim({
						top: [70, 0]
					}),
					// move down
					div.anim({
						top: [0, 70]
					})
				);
			});
			
			animGroup.start();
	*/
	function Group() {
		// make this work even if it's called without 'new'
	}
	GroupProto = Group.prototype;
	
	/**
		@name glow.anim.Group#duration
		@type number
		@description Length of the animation in seconds
		
		// implementation note: (delete this later)
		This will need to be generated after each call to #channel
		Won't be too expensive, just work out the length of the new
		channel and Math.max(newChannel, this.duration)
	*/
	GroupProto.duration = 0;
	
	/**
		@name glow.anim.Group#position
		@type number
		@description Position of the animation in seconds
	*/
	GroupProto.position = 0;
	
	/**
		@name glow.anim.Group#isPlaying
		@description true if the animation is playing.
		@returns {boolean}
	*/
	GroupProto.isPlaying = false;
	
	/**
		@name glow.anim.Group#loop
		@description Loop the animation?
			This value can be changed while the animation is playing.
			
			Looped animations will fire a 'complete' event on each loop.
			
		@returns {boolean}
	*/
	GroupProto.loop = false;
	
	/**
		@name glow.anim.Group#start
		@function
		@description Starts playing the animation
		
		@param {number} [start] Position to start the animation at, in seconds.
			By default, this will be the last position of the animation (if it was stopped)
			or 0.
		
		@returns {glow.anim.Group}
	*/
	GroupProto.start = function() {};
	
	/**
		@name glow.anim.Group#stop
		@function
		@description Stops the animation playing.
			Stopped animations can be resumed by calling {@link glow.anim.Group#start start}.
		@returns {glow.anim.Group}
	*/
	GroupProto.stop = function() {};
	
	/**
		@name glow.anim.Group#destroy
		@function
		@description Destroys all animations in the group & detaches references to DOM nodes
			This frees memory & is called automatically when the animation completes
		@returns {glow.anim.Group}
	*/
	GroupProto.destroy = function() {};
	
	/**
		@name glow.anim.Group#goTo
		@function
		@description Goes to a specific point in the animation.
		@param {number} pos Position in the animation to go to, in seconds

		@example
			// move the animation to 2.5 seconds in
			// If the animation is playing, it will continue to play from the new position.
			// Otherwise, it will simply move to that position.
			myAnimGroup.goTo(2.5);
			
		@returns {glow.anim.Group}
		
		// implementation note: (delete this later)
		This isn't as simple as glow.anim.Anim#goTo, this needs to go through
		all animations and set finished animations to their end position,
		then set all animations that haven't started to their start position.
		
		Imagine each of these animations are 1 second long
		var myAnimGroup = glow.anim.Group().channel(anim1, anim2, anim3);
		Calling myAnimGroup.goTo(1.5) will have this effect
		anim1.goTo(1);
		anim2.goTo(0.5);
		anim3.goTo(0);
	*/
	GroupProto.goTo = function() {};
	
	/**
		@name glow.anim.Group#channel
		@function
		@description Add a channel of animations to the group
			Animations in a channel will run one after another.
			
			Each channel runs at the same time, always staying in sync.
		
		@param {number|function|glow.anim.Anim|glow.anim.Group} item+ Item to add to the group
			Animation groups can be placed within animation groups
			
			Numbers will be treated as number of seconds to pause before the next item.
			
			Functions will be called. If the function takes 0.5 seconds to call, the next
			animation will start 0.5 seconds in, keeping everything in sync.
			
		@returns {glow.anim.Group}
	*/
	GroupProto.channel = function() {};
	
	/**
		@name glow.anim.Group#event:start
		@event
		@description Fires when an animation starts.
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			prevents this animation from starting.
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.anim.Group#event:stop
		@event
		@description Fires when an animation is stopped before completing
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			prevents this animation from stopping.
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.anim.Group#event:complete
		@event
		@description Fires when an animation completes
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			causes the animation to loop.
		
		@param {glow.events.Event} event Event Object
		
		@example
			// Make an animation loop 5 times
			var loopCount = 5;
			myAnimGroup.on('complete', function() {
				return !!loopCount--;
			});
	*/
	
	// export
	glow.anim.Group = Group;
});