Glow.provide(function(glow) {
	var tweens = glow.tweens = {};
	/**
	@name glow.tweens
	@namespace
	@description Functions for controlling the motion of an animation
	*/
	
	/*
	@name _reverse
	@private
	@description Takes a tween function and returns a function which does the reverse
	*/
	function _reverse(tween) {
		return function(t) {
			return 1 - tween(1 - t);
		}
	}
	
	/**
	@name glow.tweens.linear
	@function
	@description Creates linear tween.	
		Will transition values from start to finish with no
		acceleration or deceleration.
	
	@returns {function}
	*/
	tweens.linear = function() {
		return function(t) { return t; };
	};
	
	/**
	@name glow.tweens.easeIn
	@function
	@description Creates a tween which starts off slowly and accelerates.
	
	@param {number} [strength=2] How strong the easing will be.
	
		The higher the number the slower the animation starts and the quicker it ends.
	
	@returns {function}
	*/
	tweens.easeIn = function(strength) {
		strength = strength || 2;
		return function(t) {
			return Math.pow(1, strength - 1) * Math.pow(t, strength);
		}	
	};
	
	
	/**
	@name glow.tweens.easeOut
	@function
	@description Creates a tween which starts off fast and decelerates.
	
	@param {number} [strength=2] How strong the easing will be.
	
		The higher the number the quicker the animation starts and the slower it ends.
	
	@returns {function}
	*/
	tweens.easeOut = function(strength) {
		return _reverse(this.easeIn(strength));
	};
	
	
	/**
	@name glow.tweens.easeBoth
	@function
	@description Creates a tween which starts off slowly, accelerates then decelerates after the half way point.
	
		This produces a smooth and natural looking transition.
	
	@param {number} [strength=2] How strong the easing is.
	
		A higher number produces a greater difference between
		start/end speed and the mid speed.
	
	@returns {function}
	*/
	tweens.easeBoth = function(strength) {
		return this.combine(this.easeIn(strength), this.easeOut(strength));
	};
	
	
	/**
	@name glow.tweens.overshootIn
	@function
	@description Returns the reverse of {@link glow.tweens.overshootOut overshootOut}
	
	@param {number} [amount=1.70158] How much to overshoot.
	
		The default is 1.70158 which results in a 10% overshoot.
	
	@returns {function}
	*/
	tweens.overshootIn = function(amount) {
		return _reverse(this.overshootOut(amount));
	};
	
	
	/**
	@name glow.tweens.overshootOut
	@function
	@description Creates a tween which overshoots its end point then returns to its end point.
	
	@param {number} [amount=1.70158] How much to overshoot.
	
		The default is 1.70158 which results in a 10% overshoot.
	
	@returns {function}
	*/
	tweens.overshootOut = function(amount) {
		amount = amount || 1.70158;
		return function(t) {
			if (t == 0 || t == 1) { return t; }
				return ((t -= 1)* t * ((amount + 1) * t + amount) + 1);
			}
	};
	
	
	/**
	@name glow.tweens.overshootBoth
	@function
	@description Returns a combination of {@link glow.tweens.overshootIn overshootIn} and {@link glow.tweens.overshootOut overshootOut}
	
	@param {number} [amount=1.70158] How much to overshoot.
	
		The default is 1.70158 which results in a 10% overshoot.
	
	@returns {function}
	*/
	tweens.overshootBoth = function(amount) {
		return this.combine(this.overshootIn(amount), this.overshootOut(amount));	
	};
	
	
	/**
	@name glow.tweens.bounceIn
	@function
	@description Returns the reverse of {@link glow.tweens.bounceOut bounceOut}
	
	@returns {function}
	*/
	tweens.bounceIn = function() {
		return _reverse(this.bounceOut());
	};
	
	
	/**
	@name glow.tweens.bounceOut
	@function
	@description Returns a tween which bounces against the final value 3 times before stopping
	
	@returns {function}
	*/
	tweens.bounceOut = function() {
		return function(t) {
			if (t < (1 / 2.75)) {
				return 7.5625 * t * t;
			}
			
			else if (t < (2 / 2.75)) {
				return (7.5625 * (t -= (1.5 / 2.75)) * t + .75);
			}
			
			else if (t < (2.5 / 2.75)) {
				return (7.5625 * (t -= (2.25 / 2.75)) * t + .9375);
			}
			
			else {
				return (7.5625 * (t -= (2.625 / 2.75)) * t + .984375);
			}
		};	
	};
		
	
	/**
	@name glow.tweens.elasticIn
	@function
	@description Returns the reverse of {@link glow.tweens.elasticOut elasticOut}
	
	@param {number} [amplitude=1] How strong the elasticity will be.
	
	@param {number} [frequency=3.33] The frequency.
	
	@returns {function}
	*/
	tweens.elasticIn = function(amplitude, frequency) {
		return _reverse(this.elasticOut(amplitude, frequency));
	};
	
	
	/**
	@name glow.tweens.elasticOut
	@function
	@description Creates a tween which has an elastic movement.
	
		You can tweak the tween using the parameters but you'll
		probably find the defaults sufficient.
	
	@param {number} [amplitude=1] How strong the elasticity is.
	
	@param {number} [frequency=3.33] The frequency.
	
	@returns {function}
	*/
	tweens.elasticOut = function(amplitude, frequency) {
		var period = 1 / (frequency || 10 / 3);
		amplitude = amplitude || 1;
		return function (t) {
			var s;
			if (t == 0 || t == 1) {
				return t;
			}
			if (amplitude < 1) {
				s = period / 4;
			}
			else {
				s = period / (2 * Math.PI) * Math.asin(1 / amplitude);
			}
			return amplitude * Math.pow(2, -10 * t) * Math.sin( (t-s) * (2 * Math.PI) / period) + 1;
		}
	};
		
	
	/**
	@name glow.tweens.combine
	@function
	@description Create a tween from two tweens.
	
		This can be useful to make custom tweens which, for example,
		start with an easeIn and end with an overshootOut. To keep
		the motion natural, you should configure your tweens so the
		first ends and the same velocity that the second starts.
	
	@param {function} tweenIn Tween to use for the first half
	
	@param {function} tweenOut Tween to use for the second half
	
	@example
		// 4.5 has been chosen for the easeIn strength so it
		// ends at the same velocity as overshootOut starts.
		var myTween = glow.tweens.combine(
			glow.tweens.easeIn(4.5),
			glow.tweens.overshootOut()
		);
	
	@returns {function}
	*/
	tweens.combine = function(tweenIn, tweenOut) {
		return function (t) {
			if (t < 0.5) {
				return tweenIn(t * 2) / 2;
			}
			else {
				return tweenOut((t - 0.5) * 2) / 2 + 0.5;
			}
		}	
	}
	
});

