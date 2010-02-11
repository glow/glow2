Glow.provide(function(glow) {
	var tweens = glow.tweens = {};
	/**
	@name glow.tweens
	@namespace
	@description Functions for modifying animations
	@see <a href="../furtherinfo/tweens">What are tweens?</a>
	
	*/
	
	
	/**
	@name glow.tweens.linear
	@function
	@description Returns linear tween.
	
	Will transition values from start to finish with no
	acceleration or deceleration.
	
	@returns {Function}
	*/
	tweens.linear = function() {};
	
	/**
	@name glow.tweens.easeIn
	@function
	@description Creates a tween which starts off slowly and accelerates.
	
	@param {Number} [strength=2] How strong the easing is.
	
	A higher number means the animation starts off slowly and
	ends more quickly.
	
	@returns {Function}
	*/
	tweens.easeIn = function() {};
	
	
	/**
	@name glow.tweens.easeOut
	@function
	@description Creates a tween which starts off fast and decelerates.
	
	@param {Number} [strength=2] How strong the easing is.
	
	A higher number means the animation starts quickly and
	ends more slowly.
	
	@returns {Function}
	*/
	tweens.easeOut = function() {};
	
	
	/**
	@name glow.tweens.easeBoth
	@function
	@description Creates a tween which starts off slowly, accelerates then decelerates after the half way point.
	
	This produces a smooth and natural looking transition.
	
	@param {Number} [strength=2] How strong the easing is.
	
	A higher number produces a greater difference between
	start / end speed and the mid speed.
	
	@returns {Function}
	*/
	tweens.easeBoth = function() {};
	
	
	/**
	@name glow.tweens.overshootIn
	@function
	@description Returns the reverse of {@link glow.tweens.overshootOut overshootOut}
	
	@param {Number} [amount=1.70158] How much to overshoot.
	
	The default is 1.70158 which results in a 10% overshoot.
	
	@returns {Function}
	*/
	tweens.overshootIn = function() {};
	
	
	/**
	@name glow.tweens.overshootOut
	@function
	@description Creates a tween which overshoots its end point then returns to its end point.
	
	@param {Number} [amount=1.70158] How much to overshoot.
	
	The default is 1.70158 which results in a 10% overshoot.
	
	@returns {Function}
	*/
	tweens.overshootOut = function() {};
	
	
	/**
	@name glow.tweens.overshootBoth
	@function
	@description Returns a combination of {@link glow.tweens.overshootIn overshootIn} and {@link glow.tweens.overshootOut overshootOut}
	
	@param {Number} [amount=1.70158] How much to overshoot.
	
	The default is 1.70158 which results in a 10% overshoot.
	
	@returns {Function}
	*/
	tweens.overshootBoth = function() {};
	
	
	/**
	@name glow.tweens.bounceIn
	@function
	@description Returns the reverse of {@link glow.tweens.bounceOut bounceOut}
	
	@returns {Function}
	*/
	tweens.bounceIn = function() {};
	
	
	/**
	@name glow.tweens.bounceOut
	@function
	@description Returns a tween which bounces against the final value 3 times before stopping
	
	@returns {Function}
	*/
	tweens.bounceOut = function() {};
	
	
	/**
	@name glow.tweens.bounceBoth
	@function
	@description Returns a combination of {@link glow.tweens.bounceIn bounceIn} and {@link glow.tweens.bounceOut bounceOut}
	
	@returns {Function}
	*/
	tweens.bounceBoth = function() {};
	
	
	/**
	@name glow.tweens.elasticIn
	@function
	@description Returns the reverse of {@link glow.tweens.elasticOut elasticOut}
	
	@param {Number} [amplitude=1] How strong the elasticity is.
	
	@param {Number} [period=0.3] The frequency period.
	
	@returns {Function}
	*/
	tweens.elasticIn = function() {};
	
	
	/**
	@name glow.tweens.elasticOut
	@function
	@description Creates a tween which has an elastic movement.
	
	You can tweak the tween using the parameters but you'll
	probably find the defaults sufficient.
	
	@param {Number} [amplitude=1] How strong the elasticity is.
	
	@param {Number} [period=0.3] The frequency period.
	
	@returns {Function}
	*/
	tweens.elasticOut = function() {};
	
	
	/**
	@name glow.tweens.elasticBoth
	@function
	@description Returns a combination of {@link glow.tweens.elasticIn elasticIn} and {@link glow.tweens.elasticOut elasticOut}
	
	@param {Number} [amplitude=1] How strong the elasticity is.
	
	@param {Number} [period=0.3] The frequency period.
	
	@returns {Function}
	*/
	tweens.elasticBoth = function() {};
	
	
	/**
	@name glow.tweens.combine
	@function
	@description Create a tween from two tweens.
	
	This can be useful to make custom tweens which, for example,
	start with an easeIn and end with an overshootOut. To keep
	the motion natural, you should configure your tweens so the
	first ends and the same velocity that the second starts.
	
	@param {Function} tweenIn Tween to use for the first half
	
	@param {Function} tweenOut Tween to use for the second half
	
	@example
	// 4.5 has been chosen for the easeIn strength so it
	// ends at the same velocity as overshootOut starts.
	var myTween = glow.tweens.combine(
	glow.tweens.easeIn(4.5),
	glow.tweens.overshootOut()
	);
	
	@returns {Function}
	*/
	tweens.combine = function() {};
	
});

