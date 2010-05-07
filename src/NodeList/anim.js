Glow.provide(function(glow) {
	var NodeList = glow.NodeList,
		NodeListProto = NodeList.prototype,
		undefined,
		parseFloat = window.parseFloat,
		// used to detect which CSS properties require units
		requiresUnitsRe = /width|height|top$|bottom$|left$|right$|spacing$|indent$|fontSize/i,
		// which simple CSS values cannot be negative
		noNegativeValsRe = /width|height|padding|opacity/,
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
			min: 0,
			max: 255
		});
	}
	
	/**
		@private
		@function
		@description Animate opacity in IE's 'special' way
	*/
	function animateIeOpacity(elm, anim, from, to) {
		to   = parseFloat(to)   * 100;
		from = parseFloat(from) * 100;
		
		// give the element 'hasLayout'
		elm.style.zoom = 1;
		
		anim.prop('filter', {
			// we only need a template if we have units
			template: 'alpha(opacity=?)',
			from: from,
			to: to,
			allowNegative: false
		});
	}
	
	/**
		@private
		@function
		@description Scroll positions
	*/
	function animateScroll(elm, anim, from, to, scrollTopOrLeft) {
		var diff;
		
		to   = parseFloat(to);
		from = parseFloat(from);
		elm = glow(elm);
		
		// auto-get start value if there isn't one
		if ( isNaN(from) ) {
			from = elm[scrollTopOrLeft]();
		}
		
		diff = to - from;
		
		anim.on('frame', function() {
			elm[scrollTopOrLeft]( diff * this.value + from );
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
			minZero = noNegativeValsRe.test(stylePropName);
		
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
			min: minZero ? 0 : undefined
		});
	}
	
	/**
		@private
		@function
		@description Makes an animtion adjust CSS values over time
	*/
	function addCssAnim(nodeList, anim, properties) {
		var to, from, i,
			property,
			propertyIsArray,
			stylePropName;
		
		for (var propName in properties) {
			property = properties[propName];
			propertyIsArray = property.push;
			stylePropName = toStyleProp(propName);
			to = propertyIsArray ? property[1] : property;
			i = nodeList.length;
			
			// do this for each nodelist item
			while (i--) {
				// deal with special values, scrollTop and scrollLeft which aren't really CSS
				// This is the only animation that can work on the window object too
				if ( propName.indexOf('scroll') === 0 && (nodeList[i].scrollTo || nodeList[i].scrollTop !== undefined) ) {
					animateScroll(nodeList[i], anim, propertyIsArray ? property[0] : undefined, to, propName);
					continue;
				}
				
				// skip non-element nodes
				if ( nodeList[i].nodeType !== 1 ) { continue; }
				
				// set new target
				anim.target( nodeList[i].style );
				
				from = propertyIsArray ? property[0] : nodeList.item(i).css(propName);
				
				// deal with colour values
				if ( propName.indexOf('color') !== -1 ) {
					animateColor(anim, stylePropName, from, to);
				}
				// nice special case for IE
				else if (glow.env.ie && stylePropName === 'opacity') {
					animateIeOpacity(nodeList[i], anim, from, to);
				}
				// assume we're dealing with simple numbers, or numbers + unit
				// eg "5px", "5px 2em", "10px 5px 1em 4px"
				else {
					animateValues(nodeList[i], anim, stylePropName, from, to);
				}
			}
		}
	}
	
	/**
		@name glow.NodeList#anim
		@function
		@description Animate properties of elements
			All elements in the NodeList are animated
			
			All CSS values which are simple numbers (with optional unit)
			are supported. Eg: width, margin-top, left
			
			All CSS values which are space-separated values are supported
			(eg background-position, margin, padding), although a 'from'
			value must be provided for short-hand properties like 'margin'.
			
			All CSS colour values are supported. Eg: color, background-color.
			
			'scrollLeft' and 'scrollTop' can be animated for elements and
			the window object.
			
			Other properties, including CSS properties with limited support, can
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
			
		@example
			// Scroll the window to the top
			glow(window).anim(2, {
				scrollTop: 0
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
		/*!debug*/
			if (arguments.length < 2 || arguments.length > 3) {
				glow.debug.warn('[wrong count] glow.NodeList#anim expects 2 or 3 arguments, not ' + arguments.length + '.');
			}
			if (typeof duration !== 'number') {
				glow.debug.warn('[wrong type] glow.NodeList#anim expects number as "duration" argument, not ' + typeof duration + '.');
			}
			if (typeof properties !== 'object') {
				glow.debug.warn('[wrong type] glow.NodeList#anim expects object as "properties" argument, not ' + typeof properties + '.');
			}
			if (opts !== undefined && typeof opts !== 'object') {
				glow.debug.warn('[wrong type] glow.NodeList#anim expects object as "opts" argument, not ' + typeof opts + '.');
			}
		/*gubed!*/
		
		opts = opts || {};
		
		var anim = new glow.anim.Anim(duration, opts);
		
		addCssAnim(this, anim, properties);
		
		// auto start
		!(opts.startNow === false) && anim.start();
		return anim;
	};
	
	/**
		@private
		@function
		@description Used as a listener for an animations's stop event.
			'this' is a nodelist of the animating item
			
			Set in queueAnim
	*/
	function queueAnimStop() {
		this.removeData('glow_lastQueuedAnim').removeData('glow_currentAnim');
	}
	
	/**
		@name glow.NodeList#queueAnim
		@function
		@description Queue an animation to run after the current animation
			All elements in the NodeList are animated
		
			This supports the same CSS properties as {@link glow.NodeList#anim},
			but the animation is not started until the previous animation (added
			via {@link glow.NodeList#queueAnim queueAnim})
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
		
		@returns {glow.NodeList}
		
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
			
		@example
			// adding listeners to a queued anim
			glow('#elementToAnimate').queueAnim(0.5, {
				height: 0
			}).lastQueuedAnim().on('complete', function() {
				alert('Animation complete!');
			});
			
		@example
			// stopping and clearing current animation queue.
			// The next animation created via queueAnim will start
			// immediately
			glow('#elementToAnimate').curentAnim().stop();
		
		@see {@link glow.NodeList#fadeIn} - Shortcut to fade elements in
		@see {@link glow.NodeList#fadeOut} - Shortcut to fade elements out
		@see {@link glow.NodeList#fadeToggle} - Shortcut to toggle the fade of an element
		@see {@link glow.NodeList#slideOpen} - Shortcut to slide an element open
		@see {@link glow.NodeList#slideShut} - Shortcut to slide an element shut
		@see {@link glow.NodeList#slideToggle} - Shortcut to toggle an element open / shut

	*/
	NodeListProto.queueAnim = function(duration, properties, opts) {
		/*!debug*/
			if (arguments.length < 2 || arguments.length > 3) {
				glow.debug.warn('[wrong count] glow.NodeList#queueAnim expects 2 or 3 arguments, not ' + arguments.length + '.');
			}
			if (typeof duration !== 'number') {
				glow.debug.warn('[wrong type] glow.NodeList#queueAnim expects number as "duration" argument, not ' + typeof duration + '.');
			}
			if (typeof properties !== 'object') {
				glow.debug.warn('[wrong type] glow.NodeList#queueAnim expects object as "properties" argument, not ' + typeof properties + '.');
			}
			if (opts !== undefined && typeof opts !== 'object') {
				glow.debug.warn('[wrong type] glow.NodeList#queueAnim expects object as "opts" argument, not ' + typeof opts + '.');
			}
		/*gubed!*/
		
		opts = opts || {};
		
		var i = this.length,
			item,
			lastQueuedAnim,
			anim,
			startNextAnim;
		
		// we don't want animations starting now
		opts.startNow = false;
		
		while (i--) {
			item = this.item(i);
			if (item[0].nodeType !== 1) { continue; }
			lastQueuedAnim = item.data('glow_lastQueuedAnim');
			// add a listener to 'stop', to clear the queue
			anim = new glow.anim.Anim(duration, opts).on('stop', queueAnimStop, item);
			item.data('glow_lastQueuedAnim', anim);
			
			// closure some properties
			(function(item, properties, anim) {
				startNextAnim = function() {
					addCssAnim(item, anim, properties);
					anim.start();
					item.data('glow_currentAnim', anim);
				}
			})(item, properties, anim);
			
			// do we start the anim now, or after the next one?
			if (lastQueuedAnim) {
				lastQueuedAnim.on('complete', startNextAnim);
			}
			else {
				startNextAnim();
			}
		}
		
		return this;
	};
	
	/**
		@name glow.NodeList#currentAnim
		@function
		@description Get the currently playing animation added via {@link glow.NodeList#queueAnim queueAnim} for this element
			If no animation is currently playing, an empty animation is returned.
			This means you don't need to check to see if the item is defined before
			calling methods on it.
			
			This method acts on the first item in the NodeList.
		
		@returns {glow.anim.Anim}
			
		@example
			// stopping and clearing current animation queue.
			// The next animation created via queueAnim will start
			// immediately
			glow('#elementToAnimate').curentAnim().stop();
		
		@example
			// Is the element animating as part of queueAnim?
			glow('#elementToAnimate').curentAnim().playing; // true/false
	*/
	NodeListProto.currentAnim = function() {
		/*!debug*/
			if (arguments.length !== 0) {
				glow.debug.warn('[wrong count] glow.NodeList#currentAnim expects 0 arguments, not ' + arguments.length + '.');
			}
		/*gubed!*/
		return this.data('glow_currentAnim') || new glow.anim.Anim(0);
	}
	
	/**
		@name glow.NodeList#lastQueuedAnim
		@function
		@description Get the last animation added via {@link glow.NodeList#queueAnim queueAnim} for this element
			If no animation has been added, an empty animation is returned.
			This means you don't need to check to see if the item is defined before
			calling methods on it.
			
			This method acts on the first item in the NodeList.
		
		@returns {glow.anim.Anim}
	*/
	NodeListProto.lastQueuedAnim = function() {
		/*!debug*/
			if (arguments.length !== 0) {
				glow.debug.warn('[wrong count] glow.NodeList#lastQueuedAnim expects 0 arguments, not ' + arguments.length + '.');
			}
		/*gubed!*/
		return this.data('glow_lastQueuedAnim') || new glow.anim.Anim(0);
	}
	
	/**
		@private
		@function
		@description This function generates the various anim shortcut functions
	*/
	function animShortcut(animName, animReverseName, animPropsFunc, defaultTween, onComplete) {
		return function(duration, opts) {
			/*!debug*/
				if (arguments.length > 2) {
					glow.debug.warn('[wrong count] glow.NodeList animation shortcuts expect 0, 1 or 2 arguments, not ' + arguments.length + '.');
				}
				if (duration !== undefined && typeof duration !== 'number') {
					glow.debug.warn('[wrong type] glow.NodeList animation shortcuts expect number as "duration" argument, not ' + typeof duration + '.');
				}
				if (opts !== undefined && typeof opts !== 'object') {
					glow.debug.warn('[wrong type] glow.NodeList animation shortcuts expect object as "opts" argument, not ' + typeof opts + '.');
				}
			/*gubed!*/
			
			opts = opts || {};
			
			var item,
				reverseAnim,
				currentAnim,
				calcDuration,
				i = this.length;
				
			opts.tween = opts.tween || defaultTween;
			
			if (duration === undefined) {
				duration = 1;
			}
			
			calcDuration = duration;
			
			while (i--) {
				item = this.item(i);
				currentAnim = item.data('glow_' + animName);
				// if this isn't an element ,or we're already animating it, skip
				if ( item[0].nodeType !== 1 || (currentAnim && currentAnim.playing) ) { continue; }
				
				// if there's a reverse anim happening & it's playing, get rid
				reverseAnim = item.data('glow_' + animReverseName);
				if (reverseAnim && reverseAnim.playing) {
					// reduce the duration if we're not fading out as much
					calcDuration = duration * (reverseAnim.position / reverseAnim.duration);
					
					reverseAnim.stop().destroy();
				}
				
				item.data('glow_' + animName,
					item.anim( calcDuration, animPropsFunc(item), opts ).on('complete', onComplete, item)
				);
			}
			
			return this;
		}
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
			
		@returns {glow.NodeList}
		
		@example
			// make a tooltip fade in & out
			var tooltip = glow('#emailTooltip');
			
			glow('#emailInput').on('focus', function() {
				tooltip.fadeIn();
			}).on('blur', function() {
				tooltip.fadeOut();
			});
	*/
	NodeListProto.fadeIn = animShortcut('fadeIn', 'fadeOut', function(item) {
		item.css('display', 'block');
		return {opacity: 1};
	}, 'easeOut', function() {
		// on comlpete
		// we remove the filter from IE to bring back cleartype
		if (glow.env.ie) {
			this[0].style.filter = '';
		}
	});
	
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
			
		@returns {glow.NodeList}
		
		@example
			// make a tooltip fade in & out
			var tooltip = glow('#emailTooltip');
			
			glow('#emailInput').on('focus', function() {
				tooltip.fadeIn();
			}).on('blur', function() {
				tooltip.fadeOut();
			});
	*/
	NodeListProto.fadeOut = animShortcut('fadeOut', 'fadeIn', function() {
		return {opacity:0}
	}, 'easeIn', function() {
		this.css('display', 'none');
	});
	
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
			
		@returns {glow.NodeList}
		
		@example
			// make a tooltip fade in & out
			var tooltip = glow('#emailTooltip');
			
			glow('#toggleTooltip').on('click', function() {
				tooltip.fadeToggle();
			});
	*/
	NodeListProto.fadeToggle = function(duration, opts) {
		var i = this.length,
			item,
			fadeOutAnim;
		
		while (i--) {
			item = this.item(i);
			if (item[0].nodeType === 1) {
				// if the element has an opacity of 0, or is currently fading out
				if ( item.css('opacity') === '0' || ((fadeOutAnim = item.data('glow_fadeOut')) && fadeOutAnim.playing) ) {
					item.fadeIn(duration, opts);
				}
				else {
					item.fadeOut(duration, opts);
				}
			}
		}
		
		return this;
	};
	
	/**
		@name glow.NodeList#slideOpen
		@function
		@description Slide elements open
			This animates an element's height from its current height to its
			full auto-height size.
			
			If the element is currently sliding shut, the slideShut animation
			will be automatically stopped.
		
		@param {number} [duration=1] Duration in seconds
		@param {Object} [opts] Options object
		@param {function|string} [opts.tween='easeBoth'] The motion of the animation.
			Strings are treated as properties of {@link glow.tweens}, although
			a tween function can be provided.
			
		@returns {glow.NodeList}
		
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
	NodeListProto.slideOpen = animShortcut('slideOpen', 'slideShut', function(item) {
		var currentHeight = item.css('height'),
			fullHeight;
		item.css('height', 'auto');
		fullHeight = item.height();
		item.css('height', currentHeight);
		return {height: fullHeight}
	}, 'easeBoth', function() {
		this.css('height', 'auto');
	});
	
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
			
		@returns {glow.NodeList}
		
		@example
			var menuContent = glow('#menu div.content');
			
			glow('#menu').on('mouseenter', function() {
				menuContent.slideOpen();
			}).on('mouseleave', function() {
				menuContent.slideShut();
			});
	*/
	NodeListProto.slideShut = animShortcut('slideShut', 'slideOpen', function(item) {
		if ( item.css('overflow') === 'visible' ) {
			item.css('overflow', 'hidden');
		}
		return {height: 0}
	}, 'easeBoth', function() {});
	
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
			
		@returns {glow.NodeList}
		
		@example
			var menuContent = glow('#menuContent');
			
			glow('#toggleMenu').on('click', function() {
				menuContent.slideToggle();
			});
	*/
	NodeListProto.slideToggle = function(duration, opts) {
		var i = this.length,
			item,
			slideShutAnim;
		
		while (i--) {
			item = this.item(i);
			if (item[0].nodeType === 1) {
				// if the element has an height of 0, or is currently sliding shut
				if ( item.height() === 0 || ((slideShutAnim = item.data('glow_slideShut')) && slideShutAnim.playing) ) {
					item.slideOpen(duration, opts);
				}
				else {
					item.slideShut(duration, opts);
				}
			}
		}
		
		return this;
	};
});