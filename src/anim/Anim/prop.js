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
	glow.anim.Anim.prototype._evalFunc = function evalFunc(str, targets) {
		var func;
		eval('func=function(){' + str + '}');
		return func;
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
			
		@returns {glow.anim.Anim}
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
	function buildValueCalculator(from, to, allowNegative, round) {
		// start with (from + (from - to) * this.value)
		var str = '(' + Number(from) + '+' + (to - from) + '*this.value)';
		
		// wrap in functions to stop negative / fraction values if needed
		if (!allowNegative) {
			str = 'Math.max(' + str + ', 0)';
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
	function compileTemplate(template, from, to, allowNegative, round) {
		// no template? That's easy.
		if (!template) {
			return buildValueCalculator(from, to, allowNegative, round);
		}
		
		var templateParts = template.split('?'),
			templatePart,
			str = '"' + templateParts[0].replace(/"/g, '\\"') + '"',
			// discover which values are arrays
			Array = window.Array,
			fromIsArray = from.constructor === Array,
			toIsArray = to.constructor === Array,
			allowNegativeIsArray = allowNegative.constructor === Array,
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
						allowNegativeIsArray ? allowNegative[iMinusOne] : allowNegative,
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
	function buildFunction(anim, targetIndex, propName, opts) {
		var targets = anim._targets,
			// this is going to be our listener for the frame event
			functionStr = anim._funcStr,
			func;
		
		functionStr += 'var target=targets[' + targetIndex + '];' +
			'target["' + propName.replace(/"/g, '\\"') + '"]=' +
			compileTemplate(opts.template, opts.from, opts.to, opts.allowNegative, opts.round) +
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
	function getFromVals(propValue, opts) {
		var results,
			template = opts.template,
			templateRegexStr;
			
		// this is easy if from values are already specified
		// or there isn't a template to follow
		if (opts.from !== undefined || !template) {
			return opts.from || propValue;
		}
		
		// turn the template into a regular expression, turning the ? into regex for detecting numbers
		templateRegexStr = glow.util.escapeRegex(template).replace(/([^\\]|^)\\\?/g, '$1(\\-?\\d+(?:\\.\\d+)?)');
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
	AnimProto.prop = function(propName, opts) {
		/*!debug*/
			if (arguments.length !== 2) {
				glow.debug.warn('[wrong count] glow.anim.Anim#prop expects 2 arguments, not ' + arguments.length + '.');
			}
			if (typeof propName !== 'string') {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects string as "propName" argument, not ' + typeof propName + '.');
			}
			if (typeof opts !== 'object') {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects object as "opts" argument, not ' + typeof opts + '.');
			}
			if (opts.to === undefined) {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects number/array as "opts.to" argument, not ' + typeof opts.to + '.');
			}
			if (opts.template !== undefined && typeof opts.template !== 'string') {
				glow.debug.warn('[wrong type] glow.anim.Anim#prop expects string as "opts.template" argument, not ' + typeof opts.template + '.');
			}
			if (this._targets.length === 0) {
				glow.debug.warn('[unmet prerequisite] glow.anim.Anim#target must be called before glow.anim.Anim#prop');
			}
		/*gubed!*/
		
		var targetIndex = this._targets.length - 1,
			target = this._targets[targetIndex];
		
		// default opts
		opts = glow.util.apply({
			from: getFromVals(target[propName], opts),
			allowNegative: true,
			round: false
		}, opts);
		
		buildFunction(this, targetIndex, propName, opts);
		
		return this;
	};
});