Glow.provide(function(glow) {
	var undefined,
		AnimProto = glow.anim.Anim.prototype;
	
	/**
		@private
		@description Mirrors a tween
	*/
	function mirrorTween(tween) {
		return function(t) {
			return tween(1 - t);
		}
	}
	
	/**
		@name glow.anim.Anim#_preReverseTween
		@private
		@type function
		@description This is the tween before it was reversed
			This means that anim.reverse().reverse() doesn't
			wrap the tween function twice, it stores it here
			so it can reinstate it.
	*/
	
	/**
		@name glow.anim.Anim#reverse
		@function
		@description Reverses this animation
			Adjusts the tween of this animation so it plays in reverse. If
			the animation is currently playing, it will continue to play.
			
			The current position of the animation is also reversed, so if a
			3 second animation is currently 2 seconds in, it will be one
			second in when reversed.
			
			This is handy for animations that do something on (for example)
			mouseenter, then need to animate back on mouseleave
		
		@returns {glow.anim.Anim}
		
		@example
			// change a nav item's background colour from white to yellow
			// when the mouse is over it, and back again when the mouse
			// exits.
			//
			// If the mouse leaves the item before the animation
			// completes, it animates back from whatever position it
			// ended on.
			glow('#nav').delegate('mouseenter', 'li', function() {
				var fadeAnim = glow(this).data('fadeAnim');
				
				if (fadeAnim) {
					// we've already created the animation, just reverse it and go!
					fadeAnim.reverse().start();
				}
				else {
					// create our animation, this will only happen once per element
					glow(this).data('fadeAnim',
						glow(this).anim(0.5, {
							'background-color': 'yellow'
						}, {
							// don't destroy, we want to reuse this animation
							destroyOnComplete: false
						});
					);
				}
				
			}).delegate('mouseleave', 'li', function() {
				// Get our animation, reverse it and go!
				glow(this).data('fadeAnim').reverse().start();
			});
	*/
	AnimProto.reverse = function() {
		/*!debug*/
			if (arguments.length !== 0) {
				glow.debug.warn('[wrong count] glow.anim.Anim#reverse expects 0 arguments, not ' + arguments.length + '.');
			}
		/*gubed!*/
		var newPosition = this.position && (1 - this.position / this.duration) * this.duration,
			oldTween = this.tween;
		
		// reverse the tween
		this.tween = this._preReverseTween || mirrorTween(this.tween);
		this._preReverseTween = oldTween;
		return this.goTo(newPosition);
	}
	
	/**
		@name glow.anim.Anim#pingPong
		@function
		@description Alters the animation so it plays forward, then in reverse
			The duration of the animation is doubled.
		
		@returns {glow.anim.Anim}
		
		@example
			// Fades #myDiv to red then back to its original colour
			// The whole animation takes 2 seconds
			glow('#myDiv').anim(1, {
				'background-color': 'red'
			}).pingPong();
	*/
	AnimProto.pingPong = function() {
		/*!debug*/
			if (arguments.length !== 0) {
				glow.debug.warn('[wrong count] glow.anim.Anim#pingPong expects 0 arguments, not ' + arguments.length + '.');
			}
		/*gubed!*/
		var oldTween = this.tween,
			oldTweenReversed = mirrorTween(oldTween);
		// double the length of the animation
		this.duration *= 2;
		this.tween = function(t) {
			return (t < 0.5) ? oldTween(t * 2) : oldTweenReversed( (t - 0.5) * 2 );
		}
		// invalidate the stored reversed tween
		this._preReverseTween = undefined;
		return this.goTo(this.position / 2);
	}
});