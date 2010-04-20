Glow.provide(function(glow) {
	/**
		@name glow.anim.Anim#_evalFunc
		@function
		@private
		@description  Evals a function to be used as a frame listener
			This function is isolated from the others to reduce the impact of
			eval() on compression and garbage collection
			
			'targets' is used by the compiled function
	*/
	glow.anim.Anim.prototype._evalFunc = function evalFunc(s, targets) {
		eval('var f=function(){' + s + '}');
		return f;
	}
});

Glow.provide(function(glow) {
	var undefined,
		AnimProto = glow.anim.Anim.prototype;
	
	/**
		@name glow.anim.Anim#_targets
		@private
		@type Object[]
		@description An array of objects added via #target
	*/
	
	/**
		@name glow.anim.Anim#target
		@function
		@description Set the target object for subsequent calls to {@link glow.anim.Anim#prop prop}
		@param {Object} newTarget New target object
			
		@returns this
		
		@example
			// animate objToAnimate.value from 0 to 10 over 3 seconds
			// and anotherObjToAnimate.data from -100 to 20 over 3 seconds
		
			var objToAnimate = {},
				anotherObjToAnimate = {};
		
			new glow.anim.Anim(3).target(objToAnimate).prop('value', {
				from: 0,
				to: 10
			}).target(anotherObjToAnimate).prop('data', {
				from: 100,
				to: -20
			})
	*/
	AnimProto.target = function(newTarget) {
		/*!debug*/
			if (arguments.length !== 1) {
				glow.debug.warn('[wrong count] glow.anim.Anim#target expects 1 argument, not ' + arguments.length + '.');
			}
			if (typeof newTarget !== 'object') {
				glow.debug.warn('[wrong type] glow.anim.Anim#target expects object as "newTarget" argument, not ' + typeof newTarget + '.');
			}
		/*gubed!*/
		this._targets[ this._targets.length ] = newTarget;
		return this;
	};
	
	/**
		@name glow.anim.Anim#_funcStr
		@private
		@type Object
		@description The string for the function _propFunc
			This is retained so it can be added to for further
			calls to prop
	*/
	AnimProto._funcStr = '';
	
	/**
		@private
		@description Returns a string that calculates the current value for a property
	*/
	function buildValueCalculator(from, to, max, min, round) {
		// start with (from + (from - to) * this.value)
		var str = '(' + Number(from) + '+' + (to - from) + '*this.value)';
		
		// wrap in functions to keep values within range / round values if needed
		if (min !== undefined) {
			str = 'Math.max(' + str + ', ' + min + ')';
		}
		if (max !== undefined) {
			str = 'Math.min(' + str + ', ' + max + ')';
		}
		if (round) {
			str = 'Math.round(' + str + ')';
		}
		
		return str;
	}
	
	/**
		@private
		@description Turn a template into a script that outputs values in place of ?
	*/
	function compileTemplate(template, from, to, max, min, round) {
		// no template? That's easy.
		if (!template) {
			return buildValueCalculator(from, to, max, min, round);
		}
		
		var templateParts = template.split('?'),
			templatePart,
			str = '"' + templateParts[0].replace(/"/g, '\\"') + '"',
			// discover which values are arrays
			Array = window.Array,
			fromIsArray = from.constructor === Array,
			toIsArray = to.constructor === Array,
			maxIsArray = max !== undefined && max.constructor === Array,
			minIsArray = min !== undefined && min.constructor === Array,
			roundIsArray = round.constructor === Array,
			iMinusOne = 0;
		
		for (var i = 1, leni = templateParts.length; i < leni; i++, iMinusOne++) {
			templatePart = templateParts[i];
			
			if ( templateParts[iMinusOne].slice(-1) === '\\' ) {
				// the user wants a literal question mark, put it back
				str += '+"?"';
			}
			else {
				// remove trailing slash, it's being used to escape a ?
				if ( templatePart.slice(-1) === '\\' ) {
					templatePart = templatePart.slice(0, -1);
				}
				str += '+' +
					buildValueCalculator(
						fromIsArray ? from[iMinusOne] : from,
						toIsArray ? to[iMinusOne] : to,
						maxIsArray ? max[iMinusOne] : max,
						minIsArray ? min[iMinusOne] : min,
						roundIsArray ? round[iMinusOne] : round
					) +
					'+"' + templatePart.replace(/"/g, '\\"') + '"';
			}
		}
		return str;
	}
	
	/**
		@private
		@description Builds the function for an animation object's frame listener
			This function animatate object properties as instructed by #prop
	*/
	function buildFunction(anim, targetIndex, propName, conf) {
		var targets = anim._targets,
			// this is going to be our listener for the frame event
			functionStr = anim._funcStr,
			func;
		
		functionStr += 'var target=targets[' + targetIndex + '];' +
			'target["' + propName.replace(/"/g, '\\"') + '"]=' +
			compileTemplate(conf.template, conf.from, conf.to, conf.max, conf.min, conf.round) +
			';'; 
		
		// retain new function string
		anim._funcStr = functionStr;
		
		// eval to create a single function to be called
		func = anim._evalFunc(functionStr, targets);
		
		// remove old listener & add new one
		anim.detach('frame', anim._propFunc).on('frame', func);
		// retain new func so we can remove it later
		anim._propFunc = func;
		func = functionStr = undefined;
	}
	
	/**
		@private
		@description Determines the value(s) to animate from
	*/
	function getFromVals(propValue, conf) {
		var results,
			template = conf.template,
			templateRegexStr;
			
		// this is easy if from values are already specified
		// or there isn't a template to follow
		if (conf.from !== undefined || !template) {
			return conf.from || propValue;
		}
		
		// turn the template into a regular expression, turning the ? into regex for detecting numbers
		templateRegexStr = glow.util.escapeRegex(template).replace(/([^\\]|^)\\\?/g, '$1(\\-?(?:\\d+)?(?:\\.\\d+)?)');
		results = new RegExp(templateRegexStr).exec(propValue);
		if (!results) {
			throw new Error('glow.anim.Anim#prop: Could not detect start values using template: ' + template);
		}
		else {
			return Array.prototype.slice.call(results, 1);
		}
	}
	
	/**
		@name glow.anim.Anim#prop
		@function
		@description Animate a property of an object.
			This shortcut adds a listener onto the animation's 'frame' event
			and changes an specific property from one value to another.
			
			Values can be simple, such as '42', or more complex, such as 'rgba(255, 255, 0, 0.8)'
			
			Before calling this, set the target object via {@link glow.anim.Anim#target}.
			
		@param {string} propertyName Name of the property to animate.
		@param {Object} conf Animation configuration object.
			All configuration properties are optional with the exception of
			'to', and 'from' in some cases (conditions below).
		
		@param {string} [conf.template] Template for complex values
			Templates can be used for values which are strings rather than numbers.
			
			Question-marks are used within templates as placeholders for animated
			values. For instance, in the template '?em' the question-mark would be
			replaced with a number resulting in animated values like '1.5em'.
			
			Multiple Question-marks can be used for properties with more than
			one animated value, eg 'rgba(?, ?, ?, ?)'. The values will be animated
			independently.
			
			A literal question-mark can be placed in a template by preceeding it
			with a backslash.
			
		@param {number|number[]} [conf.from] Value(s) to animate from
			This can be a single number, or an array of numbers; one for each
			question-mark in the template.
			
			If ommited, the from value(s) will be taken from the object. This
			will fail if the current value is undefined or is in a format
			different to the template.
			
		@param {number|number[]} conf.to Value(s) to animate to
			This can be a single number, or an array of numbers; one for each
			question-mark in the template.
			
		@param {boolean|boolean[]} [conf.round=false] Round values to the nearest whole number?
			Use this to prevent the property being set to a fractional value.
			
			This can be a single boolean, or an array of booleans; one for each
			question-mark in the template. This is useful for templates like 'rgba(?, ?, ?, ?)',
			where the rgb values need to be whole numbers, but the alpha value is
			between 0-1.
		
		@param {number|number[]} [conf.min] Minimum value(s)
			Use this to stop values animating beneath certain values.
			
			Eg, some tweens go beyond their end position, but heights cannot
			be negative.
			
			This can be a single number, or an array of numbers; one for each
			question-mark in the template. 'undefined' means no restriction.
			
		@param {number|number[]} [conf.max] Maximum value(s)
			Use this to stop values animating beyond certain values.
			
			Eg, some tweens go beyond their end position, but colour values cannot
			be greater than 255.
			
			This can be a single number, or an array of numbers; one for each
			question-mark in the template. 'undefined' means no restriction.
			
		@returns this
		
		@example
			// Using glow.anim.Anim to animate an SVG blur over 5 seconds, with an easeOut tween
			glow.anim.Anim(5, {
				tween: 'easeOut'
			}).target(feGaussianBlurElm).prop('stdDeviation', {
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
	*/
	AnimProto.prop = function(propName, conf) {
		/*!debug*/
			if (arguments.length !== 2) {
				glow.debug.warn('[wrong count] glow.anim.Anim#prop expects 2 arguments, not ' + arguments.length + '.');
			}
			if (typeof propName !== 'string') {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects string as "propName" argument, not ' + typeof propName + '.');
			}
			if (typeof conf !== 'object') {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects object as "conf" argument, not ' + typeof conf + '.');
			}
			if (conf.to === undefined || (!conf.to.push && typeof conf.to !== 'number') ) {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects number/array as "conf.to" argument, not ' + typeof conf.to + '.');
			}
			if (conf.from !== undefined && (!conf.from.push && typeof conf.from !== 'number') ) {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects number/array as "conf.from" argument, not ' + typeof conf.from + '.');
			}
			if (conf.template !== undefined && typeof conf.template !== 'string') {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects string as "conf.template" argument, not ' + typeof conf.template + '.');
			}
			if (this._targets.length === 0) {
				glow.debug.warn('[unmet prerequisite] glow.anim.Anim#target must be called before glow.anim.Anim#prop');
			}
		/*gubed!*/
		
		var targetIndex = this._targets.length - 1,
			target = this._targets[targetIndex];
		
		// default conf
		conf = glow.util.apply({
			from: getFromVals(target[propName], conf),
			round: false
		}, conf);
		
		buildFunction(this, targetIndex, propName, conf);
		
		return this;
	};
});