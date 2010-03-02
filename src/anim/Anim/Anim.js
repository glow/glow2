/**
	@name glow.anim
	@namespace
	@description Creating and synchronising animations
*/
Glow.provide(function(glow) {
	var undefined,
		AnimProto,
		activeAnims = [],
		activeAnimsLen = 0,
		animInterval;
	
	/**
		@private
		@function
		@description This is called on each interval
			This set the properties of each animation per frame.
	*/
	function onInterval() {
		var dateNum = new Date().valueOf(),
			i = activeAnimsLen,
			anim;
		
		while (i--) {
			// ideally, this processing would be a function of Anim, but it's quicker this way
			anim = activeAnims[i];
			anim.position = (dateNum - anim._syncTime) / 1000;
			
			// see if this animation is ready to complete
			if (anim.position >= anim.duration) {
				anim.position = anim.duration;
				anim.value = anim.tween(1);
				// render final frame
				anim.fire('frame');
				// fire 'frame' and 'complete' and see if we're going to loop (preventing default)
				if ( anim.fire('complete').defaultPrevented() || anim.loop ) {
					// loop the animation
					anim._syncTime = dateNum;
				}
				// else deactivave the anim
				else {
					// reset the stop position so further starts start from the beginning
					anim._stopPos = 0;
					deactivateAnim(anim);
					// destroy the anim if needed
					anim.destroyOnComplete && anim.destroy();
				}
				continue;
			}
			
			// set up the value and render a frame
			anim.value = anim.tween( anim.position / anim.duration );
			anim.fire('frame');
		}
	}
	
	/**
		@private
		@function
		@description Calls 'frame' on an animation on an interval	
	*/
	function activateAnim(anim) {
		// if this is the first anim, start the timer
		if (!activeAnimsLen) {
			// 13 is the rate most browsers update their date object, more frequent is a waste of CPU
			animInterval = setInterval(onInterval, 13);
		}
		activeAnims[activeAnimsLen] = anim;
		// this id is used to quickly remove the anim from the array later
		anim._activeId = activeAnimsLen++;
		anim.playing = true;
	}
	
	/**
		@private
		@function
		@description Stops calling 'frame' on an animation on an interval
	*/
	function deactivateAnim(anim) {
		activeAnims.splice(anim._activeId, 1);
		activeAnimsLen--;
		// if we're out of anims, stop the timer
		if (!activeAnimsLen) {
			clearInterval(animInterval);
		}
		anim.playing = false;
	}
	
	/**
		@name glow.anim.Anim
		@extends glow.events.Target
		@class
		@description Animate an object
			To animate CSS properties, see {@link glow.NodeList#anim}
			
			Once you have an Anim instance, the {@link glow.anim.Anim#prop} method
			can be used to easily animate object properties from one value to another.
			If this isn't suitable, listen for the 'frame' event to change values
			over time.
			
		@param {number} duration Length of the animation in seconds.
		@param {Object} opts Object of options.
		@param {function|string} [opts.tween='easeBoth'] The way the value moves through time.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
		@param {boolean} [opts.destroyOnComplete=true] Destroy the animation once it completes (unless it loops)?
			This will free any DOM references the animation may have created. Once
			the animation is destroyed, it cannot be started again.
		@param {boolean} [opts.loop=true] Loop the animation.
			Looped animations will fire a 'complete' event on each loop.
			
		@example
			// Using glow.anim.Anim to animate an SVG blur over 5 seconds
			glow.anim.Anim(5).target(feGaussianBlurElm).prop('stdDeviation', {
				from: 0,
				to: 8
			}).start();
			
		@example
			// Animate a CSS property we don't support in glow.NodeList#anim
			// This rotates a Mozilla CSS gradient
			var styleObject = glow('#nav').prop('style');
			
			glow.anim.Anim(10).target(styleObject).prop('background', {
				// the question-mark in the template is replaced with the animate value
				template: '-moz-linear-gradient(?deg, red, blue)'
				from: 0,
				to: 360
			}).start();
			
		@example
			// Animate a CSS property we don't support in glow.NodeList#anim
			// This changes the colour of a webkit drop shadow from yellow to blue
			var styleObject = glow('#nav').prop('style');
			
			glow.anim.Anim(3).target(styleObject).prop('WebkitBoxShadow', {
				// the ? in the template are replaced with the animate values
				template: 'rgb(?, ?, ?) 0px 4px 14px'
				// provide a 'from' and 'to' value for each question-mark
				from: [255, 255, 0],
				to: [0, 0, 255],
				// round the value, colours can't be fractional
				round: true
			}).start();
			
		@example
			// Make an ASCII progress bar animate from:
			// [--------------------] 0%
			// to
			// [||||||||||||||||||||] 100%
			var progressBar = glow('#progressBar'),
				// our progress bar is 20 chars
				barSize = 20;
				
			glow.anim.Anim(2).on('frame', function() {
				var onChars = Math.floor(this.value * barSize),
					offChars = barSize - onChars,
					// add the | and - chars
					barStr = new Array(onChars + 1).join('|') + new Array(offChars + 1).join('-');
				
				progressBar.text('[' + barStr + '] ' + Math.floor(this.value * 100) + '%');
			}).start();

		@see {@link glow.NodeList#anim} - shortcut for animating CSS values on an element
	*/
	
	function Anim(duration, opts) {
		if (this === glow.anim) {
			return new Anim(duration, opts);
		}
		
		opts = opts || {};
		
		this.destroyOnComplete = (opts.destroyOnComplete !== false);
		
		if (typeof opts.tween === 'string') {
			this.tween = glow.tweens[opts.tween]();
		}
		else {
			this.tween = opts.tween || this.tween;
		}
		
		this.loop = !!opts.loop;
		this.duration = duration;
		// defined & used in prop.js
		this._targets = [];
	};
	
	glow.util.extend(Anim, glow.events.Target);
	AnimProto = Anim.prototype;
	
	/**
		@name glow.anim.Anim#_activeId
		@private
		@type number
		@description The index this anim exists in activeAnims
	*/
	
	/**
		@name glow.anim.Anim#_syncTime
		@private
		@type number
		@description Number used to work out where the animation should be against the current date
			If an animation starts at 0, this number will be new Date().valueOf(), it'll be
			lower for animations that start at a midpoint
	*/
	
	/**
		@name glow.anim.Anim#_stopPos
		@private
		@type number
		@description The position the animation was stopped at
			This is set on .stop() and used to resume from
			the same place on .start()
	*/
	
	/**
		@name glow.anim.Anim#duration
		@type number
		@description Length of the animation in seconds
	*/
	AnimProto.duration = 0;
	
	/**
		@name glow.anim.Anim#tween
		@type function
		@description The tween used by the animation.
	*/
	AnimProto.tween = glow.tweens.easeBoth();
	
	/**
		@name glow.anim.Anim#position
		@type number
		@description Position of the animation in seconds
	*/
	AnimProto.position = 0;
	
	/**
		@name glow.anim.Anim#playing
		@type boolean
		@description true if the animation is playing.
	*/
	AnimProto.playing = false;
	
	/**
		@name glow.anim.Anim#loop
		@type boolean
		@description Loop the animation?
			This value can be changed while an animation is playing.
			
			Looped animations will fire a 'complete' event on each loop.
	*/
	
	/**
		@name glow.anim.Anim#destroyOnComplete
		@type boolean
		@description Destroy the animation once it completes (unless it loops)?
			This will free any DOM references the animation may have created. Once
			the animation is destroyed, it cannot be started again.
	*/
	
	/**
		@name glow.anim.Anim#value
		@type number
		@description Current tweened value of the animation, usually between 0 & 1.
			This can be used in frame events to change values between their start
			and end value.
			
			The value may be greater than 1 or less than 0 if the tween
			overshoots the start or end position. {@link glow.tweens.elasticOut}
			for instance will result in values higher than 1, but will still end at 1.
		
		@example
			// Work out a value between startValue & endValue for the current point in the animation
			var currentValue = (endValue - startValue / myAnim.value) + startValue;
	*/
	AnimProto.value = 0;
	
	/**
		@name glow.anim.Anim#start
		@function
		@description Starts playing the animation
			If the animation is already playing, this has no effect.
		
		@param {number} [position] Position to start the animation at, in seconds.
			By default, this will be the last position of the animation (if it was stopped)
			or 0.
		
		@returns {glow.anim.Anim}
	*/
	AnimProto.start = function(position) {
		if ( !this.playing && !this.fire('start').defaultPrevented() ) {
			// we set 'playing' here so goTo knows
			this.playing = true;
			this.goTo(position || this._stopPos || 0);
			activateAnim(this);
		}
		return this;
	};
	
	/**
		@name glow.anim.Anim#stop
		@function
		@description Stops the animation playing.
			Stopped animations can be resumed by calling {@link glow.anim.Anim#start start}.
			
			If the animation isn't playing, this has no effect.
		@returns {glow.anim.Anim}
	*/
	AnimProto.stop = function() {
		if ( this.playing && !this.fire('stop').defaultPrevented() ) {
			this._stopPos = this.position;
			deactivateAnim(this);
		}
	};
	
	/**
		@name glow.anim.Anim#destroy
		@function
		@description Destroys the animation & detaches references to objects
			This frees memory & is called automatically when an animation
			completes.
		@returns {glow.anim.Anim}
	*/
	AnimProto.destroy = function() {
		glow.events.removeAllListeners( [this] );
		this._targets = undefined;
		return this;
	};
	
	/**
		@name glow.anim.Anim#goTo
		@function
		@description Goes to a specific point in the animation.
		@param {number} pos Position in the animation to go to, in seconds

		@example
			// move the animation to 2.5 seconds in
			// If the animation is playing, it will continue to play from the new position.
			// Otherwise, it will simply move to that position.
			myAnim.goTo(2.5);
			
		@returns {glow.anim.Anim}
	*/
	AnimProto.goTo = function(pos) {
		if (pos > this.duration) {
			pos = this.duration;
		}
		else if (pos < 0) {
			pos = 0;
		}
		// set stopPos to this so the next call to start() starts from here
		this._stopPos = this.position = pos;
		// move the syncTime for this position if we're playing
		if (this.playing) {
			this._syncTime = new Date - (pos * 1000);
		}
		this.value = this.tween(pos / this.duration);
		this.fire('frame');
		return this;
	};
	
	/**
		@name glow.anim.Anim#event:start
		@event
		@description Fires when an animation starts.
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			prevents this animation from starting.
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.anim.Anim#event:frame
		@event
		@description Fires on each frame of the animation
			Use a combination of this event and {@link glow.anim.Anim#value value}
			to create custom animations.
			
			See the {@link glow.anim.Anim constructor} for usage examples.
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.anim.Anim#event:stop
		@event
		@description Fires when an animation is stopped before completing
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			prevents this animation from stopping.
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.anim.Anim#event:complete
		@event
		@description Fires when an animation completes
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			causes the animation to loop.
		
		@param {glow.events.Event} event Event Object
		
		@example
			// Make an animation loop 5 times
			var loopCount = 5;
			myAnim.on('complete', function() {
				return !loopCount--;
			});
	*/
	
	// export
	glow.anim = {};
	glow.anim.Anim = Anim;
});