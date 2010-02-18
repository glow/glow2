Glow.provide(function(glow) {
	var undefined,
		TimelineProto;
	
	/**
		@name glow.anim.Timeline
		@extends glow.events.Target
		@class
		@description Sequence and synchronise multiple animations
			This can be used to easily chain animations together
			and ensure that multiple animations stay in sync
			with each other.
			
		@param {Object} [opts] Options object.
		
		@param {boolean} [opts.loop=true] Loop the animation.
			Looped timelines will fire a 'complete' event on each loop.
			
			// implementation note: (delete this later)
			this is just a shortcut for setting #loop
			
		@param {boolean} [opts.destroyOnComplete=true] Destroy animations in the timeline once it completes (unless it loops).
			This will free any DOM references the animations may have created. Once
			the animations are destroyed, the timeline cannot be started again.
			
		@example
			// play 3 animations one after another
			glow.anim.Timeline().track(anim1, anim2, anim3).start();
			
		@example
			// play 2 animations at the same time
			glow.anim.Timeline()
				.track(anim1)
				.track(anim2)
				.start();
			
		@example
			// play 2 animations with a second pause in between
			glow.anim.Timeline().track(anim1, 1, anim2).start();
			
		@example
			// Make a 'mexican wave'
			// #waveContainer contains 100 divs absolutely positioned next to each other
			
			var animTimeline = glow.anim.Timeline({
				loop: true
			});
			
			//create a wave up & wave down anim for each div
			var wavingDivs = glow("#waveContainer div").each(function(i) {
				var div = glow(this);
			
				animTimeline.track(
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
			
			animTimeline.start();
	*/
	function Timeline() {
		// make this work even if it's called without 'new'
	}
	TimelineProto = Timeline.prototype;
	
	/**
		@name glow.anim.Timeline#duration
		@type number
		@description Length of the animation in seconds
		
		// implementation note: (delete this later)
		This will need to be generated after each call to #track
		Won't be too expensive, just work out the length of the new
		track and Math.max(newTrack, this.duration)
	*/
	TimelineProto.duration = 0;
	
	/**
		@name glow.anim.Timeline#position
		@type number
		@description Position of the animation in seconds
	*/
	TimelineProto.position = 0;
	
	/**
		@name glow.anim.Timeline#isPlaying
		@description true if the animation is playing.
		@returns {boolean}
	*/
	TimelineProto.isPlaying = false;
	
	/**
		@name glow.anim.Timeline#loop
		@description Loop the animation?
			This value can be changed while the animation is playing.
			
			Looped animations will fire a 'complete' event on each loop.
			
		@returns {boolean}
	*/
	TimelineProto.loop = false;
	
	/**
		@name glow.anim.Timeline#start
		@function
		@description Starts playing the animation
		
		@param {number} [start] Position to start the animation at, in seconds.
			By default, this will be the last position of the animation (if it was stopped)
			or 0.
		
		@returns {glow.anim.Timeline}
	*/
	TimelineProto.start = function() {};
	
	/**
		@name glow.anim.Timeline#stop
		@function
		@description Stops the animation playing.
			Stopped animations can be resumed by calling {@link glow.anim.Timeline#start start}.
		@returns {glow.anim.Timeline}
	*/
	TimelineProto.stop = function() {};
	
	/**
		@name glow.anim.Timeline#destroy
		@function
		@description Destroys all animations in the timeline & detaches references to DOM nodes
			This frees memory & is called automatically when the animation completes
		@returns {glow.anim.Timeline}
	*/
	TimelineProto.destroy = function() {};
	
	/**
		@name glow.anim.Timeline#goTo
		@function
		@description Goes to a specific point in the animation.
		@param {number} pos Position in the animation to go to, in seconds

		@example
			// move the animation to 2.5 seconds in
			// If the animation is playing, it will continue to play from the new position.
			// Otherwise, it will simply move to that position.
			myTimeline.goTo(2.5);
			
		@returns {glow.anim.Timeline}
		
		// implementation note: (delete this later)
		This isn't as simple as glow.anim.Anim#goTo, this needs to go through
		all animations and set finished animations to their end position,
		then set all animations that haven't started to their start position.
		
		Imagine each of these animations are 1 second long
		var myTimeline = glow.anim.Timeline().track(anim1, anim2, anim3);
		Calling myTimeline.goTo(1.5) will have this effect
		anim1.goTo(1);
		anim2.goTo(0.5);
		anim3.goTo(0);
	*/
	TimelineProto.goTo = function() {};
	
	/**
		@name glow.anim.Timeline#track
		@function
		@description Add a track of animations to the timeline
			Animations in a track will run one after another.
			
			Each track runs at the same time, always staying in sync.
		
		@param {number|function|glow.anim.Anim|glow.anim.Timeline} item+ Item to add to the timelines
			Animation timelines can be placed within animation timelines
			
			Numbers will be treated as number of seconds to pause before the next item.
			
			Functions will be called. If the function takes 0.5 seconds to call, the next
			animation will start 0.5 seconds in, keeping everything in sync.
			
		@returns {glow.anim.Timeline}
	*/
	TimelineProto.track = function() {};
	
	/**
		@name glow.anim.Timeline#event:start
		@event
		@description Fires when an animation starts.
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			prevents this animation from starting.
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.anim.Timeline#event:stop
		@event
		@description Fires when an animation is stopped before completing
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			prevents this animation from stopping.
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.anim.Timeline#event:complete
		@event
		@description Fires when an animation completes
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			causes the animation to loop.
		
		@param {glow.events.Event} event Event Object
		
		@example
			// Make an animation loop 5 times
			var loopCount = 5;
			myTimeline.on('complete', function() {
				return !!loopCount--;
			});
	*/
	
	// export
	glow.anim.Timeline = Timeline;
});