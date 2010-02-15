/**
	@name glow.anim
	@namespace
	@description Creating and synchronising animations
*/
Glow.provide(function(glow) {
	var undefined,
		AnimProto;
	
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
		@param {boolean} [opts.destroyOnComplete=true] Destroy the animation once it completes (unless it loops).
			This will free any DOM references the animation may have created. Once
			the animation is destroyed, it cannot be started again.
		@param {boolean} [opts.loop=true] Loop the animation.
			Looped animations will fire a 'complete' event on each loop.
			
			// implementation note: (delete this later)
			this is just a shortcut for setting #loop
			
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
	function Anim() {
		// implementation note: make this work if the user omits 'new'
	}
	AnimProto = Anim.prototype;
	
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
		@name glow.anim.Anim#isPlaying
		@description true if the animation is playing.
		@returns {boolean}
	*/
	AnimProto.isPlaying = false;
	
	/**
		@name glow.anim.Anim#loop
		@description Loop the animation?
			This value can be changed while an animation is playing.
			
			Looped animations will fire a 'complete' event on each loop.
			
		@returns {boolean}
		
		// implementation note: (delete this later)
		Looping is handled by returning false in the 'complete' event and should
		be implemented something like:
		
		thisAnim.on('complete', function() {
			return !this.loop;
		});
	*/
	AnimProto.loop = false;
	
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
		
		@param {number} [start] Position to start the animation at, in seconds.
			By default, this will be the last position of the animation (if it was stopped)
			or 0.
		
		@returns {glow.anim.Anim}
		
		// implementation note: (delete this later)
		anim.start(6.5);
		is simply a shortcut for
		anim.goTo(6.5).start();
		The order is important, so the start event fires after the goTo
	*/
	AnimProto.start = function() {};
	
	/**
		@name glow.anim.Anim#stop
		@function
		@description Stops the animation playing.
			Stopped animations can be resumed by calling {@link glow.anim.Anim#start start}.
		@returns {glow.anim.Anim}
	*/
	AnimProto.stop = function() {};
	
	/**
		@name glow.anim.Anim#destroy
		@function
		@description Destroys the animation & detaches references to DOM nodes
			This frees memory & is called automatically when an animation
			completes.
		@returns {glow.anim.Anim}
	*/
	AnimProto.destroy = function() {};
	
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
	AnimProto.goTo = function() {};
	
	/**
		@name glow.anim.Anim#target
		@function
		@description Set the target object for subsequent calls to {@link glow.anim.Anim#prop prop}
		@param {Object} newTarget New target object
			
		@returns {glow.anim.Anim}
	*/
	AnimProto.target = function() {};
	
	/**
		@name glow.anim.Anim#prop
		@function
		@description Animate a property of an object.
			This shortcut adds a listener onto the animation's 'frame' event
			and changes an specific property from one value to another.
			
			Values can be simple, such as '42', or more complex, such as 'rgba(255, 255, 0, 0.8)'
			
			Before calling this, set the target object via {@link glow.anim.Anim#target}.
			
		@param {string} propertyName Name of the property to animate.
		@param {Object} opts Options object
		@param {string} [opts.template] Template for complex values
			Templates can be used for values which are strings rather than numbers.
			
			Question-marks are used within templates as placeholders for animated
			values. For instance, in the template '?em' the question-mark would be
			replaced with a number resulting in animated values like '1.5em'.
			
			Multiple Question-marks can be used for properties with more than
			one animated value, eg 'rgba(?, ?, ?, ?)'. The values will be animated
			independently.
			
			A literal question-mark can be placed in a template by preceeding it
			with a backslash.
			
		@param {number|number[]} [opts.from] Value(s) to animate from
			This can be a single number, or an array of numbers; one for each
			question-mark in the template.
			
			If ommited, the from value(s) will be taken from the object. This
			will fail if the current value is undefined or is in a format
			different to the template.
			
		@param {number|number[]} opts.to Value(s) to animate to
			This can be a single number, or an array of numbers; one for each
			question-mark in the template.
			
		@param {boolean|boolean[]} opts.round Round values to the nearest whole number?
			Use this to prevent the property being set to a fractional value.
			
			This can be a single boolean, or an array of booleans; one for each
			question-mark in the template. This is useful for templates like 'rgba(?, ?, ?, ?)',
			where the rgb values need to be whole numbers, but the alpha value is
			between 0-1.
			
		@param {boolean|boolean[]} [opts.round=false] Round values to the nearest whole number?
			Use this to prevent the property being set to a fractional value.
			
			This can be a single boolean, or an array of booleans; one for each
			question-mark in the template. This is useful for templates like 'rgba(?, ?, ?, ?)',
			where the rgb values need to be whole numbers, but the alpha value is
			between 0-1.
		
		@param {boolean|boolean[]} [opts.allowNegative=true] Allow values to be negative?
			If false, negative values will become zero.
			
			This can be a single boolean, or an array of booleans; one for each
			question-mark in the template.
			
		@returns {glow.anim.Anim}
	*/
	AnimProto.prop = function() {};
	
	/**
		@name glow.anim.Anim#event:start
		@event
		@description Fires when an animation starts.
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			prevents this animation from starting.
		
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
				return !!loopCount--;
			});
	*/
	
	// export
	glow.anim = {};
	glow.anim.Anim = Anim;
});