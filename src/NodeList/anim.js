Glow.provide(function(glow) {
	var NodeList = glow.NodeList,
		NodeListProto = NodeList.prototype,
		undefined,
		parseFloat = window.parseFloat,
		// used to detect which CSS properties require units
		requiresUnitsRe = /width|height|top$|bottom$|left$|right$|spacing$|indent$|fontSize/,
		// which simple CSS values cannot be negative
		noNegativeValsRe = /width|height|padding/,
		getUnit = /\D+$/,
		usesYAxis = /height|top/;
	
	// TODO: get this from appearence.js
	function toStyleProp(prop) {
		if (prop == 'float') {
			return glow.env.ie ? 'styleFloat' : 'cssFloat';
		}
		return prop.replace(/-(\w)/g, function(match, p1) {
			return p1.toUpperCase();
		});
	}
	
	/**
		@private
		@function
		@param {nodelist} element
		@param {string} toUnit (em|%|pt...)
		@param {string} axis (x|y)
		@description Converts a css unit.
			We need to know the axis for calculating relative values, since they're
			relative to the width / height of the parent element depending
			on the situation.
	*/
	var testElement = glow('<div style="position:absolute;visibility:hidden;border:0;margin:0;padding:0"></div>');
	
	function convertCssUnit(element, value, toUnit, axis) {
		var elmStyle = testElement[0].style,
			axisProp = (axis === 'x') ? 'width' : 'height',
			startPixelValue,
			toUnitPixelValue;
		
		startPixelValue = testElement.css(axisProp, value).insertAfter(element)[axisProp]();
		// using 10 of the unit then dividing by 10 to increase accuracy
		toUnitPixelValue = testElement.css(axisProp, 10 + toUnit)[axisProp]() / 10;
		testElement.remove();
		return startPixelValue / toUnitPixelValue;
	}
	
	/**
		@private
		@function
		@description Animate a colour value
	*/
	function animateColor(anim, stylePropName, from, to) {
		to = NodeList._parseColor(to);
		to = [to.r, to.g, to.b];
		from = NodeList._parseColor(from);
		from = [from.r, from.g, from.b];
		
		anim.prop(stylePropName, {
			// we only need a template if we have units
			template: 'rgb(?,?,?)',
			from: from,
			to: to,
			round: true,
			allowNegative: false
		});
	}
	
	/**
		@private
		@function
		@description Animate simple values
			This is a set of space-separated numbers (42) or numbers + unit (42em)
			
			Units can be mixed
	*/
	function animateValues(element, anim, stylePropName, from, to) {
		var toUnit,
			fromUnit,
			round = [],
			template = '',
			requiresUnits = requiresUnitsRe.test(stylePropName),
			allowNegative = !noNegativeValsRe.test(stylePropName);
		
		from = String(from).split(' ');
		to = String(to).split(' ');
		
		for (var i = 0, leni = to.length; i < leni; i++) {
			toUnit   = ( getUnit.exec( to[i] )   || [''] )[0];
			fromUnit = ( getUnit.exec( from[i] ) || [''] )[0];
			
			// create initial units if required
			if (requiresUnits) {
				toUnit = toUnit || 'px';
				fromUnit = fromUnit || 'px';
			}
			
			round[i] = (toUnit === 'px');
			
			// make the 'from' unit the same as the 'to' unit
			if (toUnit !== fromUnit) {
				from = convertCssUnit( element, from, toUnit, usesYAxis.test(stylePropName) ? 'y' : 'x' );
			}
			
			template += ' ?' + toUnit;
			from[i] = parseFloat( from[i] );
			to[i]   = parseFloat( to[i] );
		}
		
		anim.prop(stylePropName, {
			template: template,
			from: from,
			to: to,
			round: round,
			allowNegative: allowNegative
		});
	}
	
	/**
		@name glow.NodeList#anim
		@function
		@description Animate CSS properties of elements
			All CSS values which are simple numbers (with optional unit)
			are supported. Eg: width, margin-top, left
			
			All CSS values which are space-separated values are supported
			(eg background-position, margin, padding), although a 'from'
			value must be provided for short-hand properties like 'margin'.
			
			All CSS colour values are supported. Eg: color, background-color.
			
			Other CSS properties, including those with limited support, can
			be animated using {@link glow.anim.Anim#prop}.
		
		@param {number} duration Length of the animation in seconds.
		@param {Object} properties Properties to animate.
			This is an object where the key is the CSS property and the value
			is the value to animate to.
			
			The value can also be an array, where the first item is the value to
			animate from, and the second is the value to animate to.
			
			Numerical values will be treated as 'px' if the property requires units.
		
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween='easeBoth'] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
		@param {boolean} [opts.destroyOnComplete=true] Destroy the animation once it completes (unless it loops).
			This will free any DOM references the animation may have created. Once
			the animation is destroyed, it cannot be started again.
		@param {boolean} [opts.loop=true] Loop the animation.
		@param {boolean} [opts.startNow=true] Start the animation straight away?
			Animations can be started by calling {@link glow.anim.Anim#start}
		
		@returns {glow.anim.Anim}
		
		@example
			// change the nav's background colour to white and the top position
			// to 20px over a duration of 3 seconds
			glow('#nav').anim(3, {
				'background-color': '#fff',
				'top': 20
			});
			
		@example
			// Fade an element out and alert 'done' when complete
			glow('#nav').anim(3, {
				'opacity': 0
			}).on('complete', function() {
				alert('done!');
			});
		
		@see {@link glow.NodeList#queueAnim} - Queue an animation to run after the current anim
		@see {@link glow.NodeList#fadeIn} - Shortcut to fade elements in
		@see {@link glow.NodeList#fadeOut} - Shortcut to fade elements out
		@see {@link glow.NodeList#fadeToggle} - Shortcut to toggle the fade of an element
		@see {@link glow.NodeList#slideOpen} - Shortcut to slide an element open
		@see {@link glow.NodeList#slideShut} - Shortcut to slide an element shut
		@see {@link glow.NodeList#slideToggle} - Shortcut to toggle an element open / shut

	*/
	NodeListProto.anim = function(duration, properties, opts) {
		opts = opts || {};
		
		var anim = new glow.anim.Anim(duration, opts),
			to, from,
			property,
			propertyIsArray,
			stylePropName,
			startNow = !(opts.startNow === false);
		
		for (var propName in properties) {
			property = properties[propName];
			propertyIsArray = property.push;
			stylePropName = toStyleProp(propName);
			to = propertyIsArray ? property[1] : property;
			i = this.length;
			
			// do this for each nodelist item
			while (i--) {
				// skip non-element nodes
				if ( this[i].nodeType !== 1 ) { continue; }
				// set new target
				anim.target( this[i].style );
				
				from = propertyIsArray ? property[0] : this.item(i).css(propName);
				
				// deal with colour values
				if ( propName.indexOf('color') !== -1 ) {
					animateColor(anim, stylePropName, from, to);
				}
				// assume we're dealing with simple numbers, or numbers + unit
				// eg "5px", "5px 2em", "10px 5px 1em 4px"
				else {
					animateValues(this[i], anim, stylePropName, from, to);
				}
			}
		}
		
		startNow && anim.start();
		return anim;
	};
	
	/**
		@name glow.NodeList#queueAnim
		@function
		@description Queue an animation to run after the current animation
			This supports the same CSS properties as {@link glow.NodeList#anim},
			but the animation is not started until the previous animation (added
			via {@link glow.NodeList#anim anim} or {@link glow.NodeList#queueAnim queueAnim})
			on that element ends.
			
			If there are no queued animations on the element, the animation starts
			straight away.
		
		@param {number} duration Length of the animation in seconds.
		@param {Object} Properties to animate.
			This is an object where the key is the CSS property and the value
			is the value to animate to.
			
			The value can also be an array, where the first item is the value to
			animate from, and the second is the value to animate to.
			
			Numerical values will be treated as 'px' if the property requires units.
		
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween='easeBoth'] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
		@param {boolean} [opts.destroyOnComplete=true] Destroy the animation once it completes (unless it loops).
			This will free any DOM references the animation may have created. Once
			the animation is destroyed, it cannot be started again.
		@param {boolean} [opts.loop=true] Loop the animation.
		@param {boolean} [opts.startNow=false] Start the animation straight away?
		
		@returns {glow.anim.Anim}
		
		@example
			// change a nav item's background colour from white to yellow
			// when the mouse is over it, and back again when the mouse
			// exits.
			glow('#nav').delegate('mouseenter', 'li', function() {
				glow(this).queueAnim(0.5, {
					'background-color': 'yellow'
				});
			}).delegate('mouseleave', 'li', function() {
				glow(this).queueAnim(0.5, {
					'background-color': 'white'
				});
			});
		
		@see {@link glow.NodeList#fadeIn} - Shortcut to fade elements in
		@see {@link glow.NodeList#fadeOut} - Shortcut to fade elements out
		@see {@link glow.NodeList#fadeToggle} - Shortcut to toggle the fade of an element
		@see {@link glow.NodeList#slideOpen} - Shortcut to slide an element open
		@see {@link glow.NodeList#slideShut} - Shortcut to slide an element shut
		@see {@link glow.NodeList#slideToggle} - Shortcut to toggle an element open / shut

	*/
	NodeListProto.queueAnim = function() {
		// implementation note, don't calculated the 'from' values until we're
		// just about to play
	};
	
	/**
		@name glow.NodeList#fadeIn
		@function
		@description Fade elements in
			If the element is currently fading out, the fadeOut animation will be automatically stopped.
		
		@param {number} [duration=1] Duration in seconds
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween='easeOut'] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
			
		@returns {glow.anim.Anim}
		
		@example
			// make a tooltip fade in & out
			var tooltip = glow('#emailTooltip');
			
			glow('#emailInput').on('focus', function() {
				tooltip.fadeIn();
			}).on('blur', function() {
				tooltip.fadeOut();
			});
	*/
	NodeListProto.fadeIn = function() {};
	
	/**
		@name glow.NodeList#fadeOut
		@function
		@description Fade elements out
			If the element is currently fading in, the fadeIn animation will be automatically stopped.
		
		@param {number} [duration=1] Duration in seconds
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween='easeIn'] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
			
		@returns {glow.anim.Anim}
		
		@example
			// make a tooltip fade in & out
			var tooltip = glow('#emailTooltip');
			
			glow('#emailInput').on('focus', function() {
				tooltip.fadeIn();
			}).on('blur', function() {
				tooltip.fadeOut();
			});
	*/
	NodeListProto.fadeOut = function() {};
	
	/**
		@name glow.NodeList#fadeToggle
		@function
		@description Fade elements in/out
			If the element is currently fading in/out, the fadeIn/fadeOut animation
			will be automatically stopped.
			
			// Implementation note: (delete me later)
			If the element has an opactity of 0, then fade in, otherwise fade out.
			UNLESS there's fadeOut animation currently happening on this element,
			then fade in.
			
		@param {number} [duration=1] Duration in seconds
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
			
			By default, 'easeIn' is used for fading out, and 'easeOut' is
			used for fading in.
			
		@returns {glow.anim.Anim}
		
		@example
			// make a tooltip fade in & out
			var tooltip = glow('#emailTooltip');
			
			glow('#toggleTooltip').on('click', function() {
				tooltip.fadeToggle();
			});
	*/
	NodeListProto.fadeToggle = function() {};
	
	/**
		@name glow.NodeList#slideOpen
		@function
		@description Slide elements open
			This animates an element's height from its current height to its
			full auto-height size.
			
			If the element is currently sliding shut, the slideShut animation
			will be automatically stopped.
			
			// Implementation note: (delete me later)
			This is a simplification from Glow 1. Glow 1 would try to determine
			if it should animate to height:auto or the height set in the CSS. But
			this got messy if the height was set to zero in the CSS.
			
			Also, Glow 1 may have always started this animation at zero-height,
			but animating it from its current height is better IMO
		
		@param {number} [duration=1] Duration in seconds
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween='easeBoth'] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
			
		@returns {glow.anim.Anim}
		
		@example
			var menuContent = glow('#menu div.content');
			
			glow('#menu').on('mouseenter', function() {
				menuContent.slideOpen();
			}).on('mouseleave', function() {
				menuContent.slideShut();
			});
		
		@example
			glow('#furtherInfoHeading').on('click', function() {
				glow('#furtherInfoContent').slideOpen();
			});
			
		@example
			// add content onto an element, and slide to reveal the new content
			glow('<div>' + newContent + '</div>').appendTo('#content').height(0).slideOpen();
			
	*/
	NodeListProto.slideOpen = function() {};
	
	/**
		@name glow.NodeList#slideShut
		@function
		@description Slide elements shut
			This animates an element's height from its current height to zero.
			
			If the element is currently sliding open, the slideOpen animation
			will be automatically stopped.
		
		@param {number} [duration=1] Duration in seconds
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween='easeBoth'] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
			
		@returns {glow.anim.Anim}
		
		@example
			var menuContent = glow('#menu div.content');
			
			glow('#menu').on('mouseenter', function() {
				menuContent.slideOpen();
			}).on('mouseleave', function() {
				menuContent.slideShut();
			});
	*/
	NodeListProto.slideShut = function() {};
	
	/**
		@name glow.NodeList#slideToggle
		@function
		@description Slide elements open/shut
			If the element is currently sliding open/shut, the slideOpen/slideShut animation
			will be automatically stopped.
			
			// Implementation note: (delete me later)
			If the element has a height of 0, then slide open, otherwise slide shut.
			UNLESS there's slideShut animation currently happening on this element,
			then slide open.
		
		@param {number} [duration=1] Duration in seconds
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween='easeBoth'] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
			
		@returns {glow.anim.Anim}
		
		@example
			var menuContent = glow('#menuContent');
			
			glow('#toggleMenu').on('click', function() {
				menuContent.slideToggle();
			});
	*/
	NodeListProto.slideToggle = function() {};
});