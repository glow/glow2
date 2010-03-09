Glow.provide(function(glow) {
	var undefined,
		TimelineProto,
		Anim = glow.anim.Anim;
	
	/**
		@private
		@description Listener for the start event on the sync anim the timeline uses
			'this' is the Timeline
	*/
	function animStart(e) {
		this.fire('start', e);
		this.playing = !e.defaultPrevented();
	}
	
	/**
		@private
		@description Listener for the stop event on the sync anim the timeline uses
			'this' is the Timeline
	*/
	function animStop(e) {
		this.fire('stop', e);
		this.playing = e.defaultPrevented();
	}
	
	/**
		@private
		@description Listener for the frame event on the sync anim the timeline uses
			'this' is the Timeline
	*/
	function animFrame(e) {
		this.goTo(this._anim.position);
		// if we're still playing, fire frame
		if (this._anim.playing) {
			this.fire('frame', e);
		}
	}
	
	/**
		@private
		@description Listener for the complete event on the sync anim the timeline uses
			'this' is the Timeline
	*/
	function animComplete(e) {
		this.fire('complete', e);
		return !( this.playing = this.loop );
	}
	
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
					// move up & down
					div.anim(1, {
						top: [70, 0]
					}).pingPong()
				);
			});
			
			animTimeline.start();
	*/
	function Timeline(opts) {
		if (this === glow.anim) {
			return new Timeline(opts);
		}
		opts = opts || {};
		this.destroyOnComplete = (opts.destroyOnComplete !== false);
		this.loop = !!opts.loop;
		this._tracks = [];
		this._currentIndexes = [];
		this._startPos = [];
		
		// create an animation to sync the timeline
		this._anim = new Anim(0, {
				destroyOnComplete: false,
				tween: 'linear'
			})
			.on('start', animStart, this)
			.on('stop', animStop, this)
			.on('frame', animFrame, this)
			.on('complete', animComplete, this);
	}
	glow.util.extend(Timeline, glow.events.Target);
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
		@name glow.anim.Timeline#playing
		@description true if the animation is playing.
		@returns {boolean}
	*/
	TimelineProto.playing = false;
	
	/**
		@name glow.anim.Timeline#loop
		@description Loop the animation?
			This value can be changed while the animation is playing.
			
			Looped animations will fire a 'complete' event on each loop.
			
		@returns {boolean}
	*/
	
	/**
		@name glow.anim.Timeline#destroyOnComplete
		@type boolean
		@description Destroy the animation once it completes (unless it loops)?
			This will free any DOM references the animation may have created. Once
			the animation is destroyed, it cannot be started again.
	*/
	
	/**
		@name glow.anim.Timeline#_tracks
		@private
		@type Array[]
		@description An array of arrays.
			Each array represents a track, containing a combination of
			animations and functions
	*/
	
	/**
		@name glow.anim.Timeline#_currentIndexes
		@private
		@type number[]
		@description Array of the current indexes within _tracks
			The indexes refer to which items that were last sent a .goTo90
	*/
	
	/**
		@name glow.anim.Timeline#_startPos
		@private
		@type Array[]
		@description Mirrors _tracks
			Contains the start positions of the items in _tracks
	*/
	
	/**
		@name glow.anim.Timeline#_anim
		@private
		@type glow.anim.Anim
		@description The single animation used to fire frames for this animation
	*/
	
	/**
		@name glow.anim.Timeline#_lastPos
		@private
		@type number
		@description Last position rendered
	*/
	TimelineProto._lastPos = 0;
	
	/**
		@name glow.anim.Timeline#start
		@function
		@description Starts playing the animation
		
		@param {number} [start] Position to start the animation at, in seconds.
			By default, this will be the last position of the animation (if it was stopped)
			or 0.
		
		@returns {glow.anim.Timeline}
	*/
	TimelineProto.start = function() {
		this._anim.start();
		return this;
	};
	
	/**
		@name glow.anim.Timeline#stop
		@function
		@description Stops the animation playing.
			Stopped animations can be resumed by calling {@link glow.anim.Timeline#start start}.
		@returns {glow.anim.Timeline}
	*/
	TimelineProto.stop = function() {
		var i = this._tracks.length,
			item;
		
		this._anim.stop();
		// check in case the event has been cancelled
		if (!this._anim.playing) {
			while (i--) {
				// get the current playing item for this track
				item = this._tracks[i][ this._currentIndexes[i] ];
				// check there is an item playing
				if (item) {
					item.fire('stop');
					item.playing = false;
				}
			}
		}
		return this;
	};
	
	/**
		@name glow.anim.Timeline#destroy
		@function
		@description Destroys all animations in the timeline & detaches references to DOM nodes
			This frees memory & is called automatically when the animation completes
		@returns {glow.anim.Timeline}
	*/
	TimelineProto.destroy = function() {
		var i = timeline._tracks.length,
			j,
			item;
		
		// destroy animations in tracks	
		while (i--) {
			j = this._tracks[i].length;
			while (j--) {
				item = this._tracks[i][j];
				item.destroy && item.destroy();
			}
		}
		
		// destroy syncing animation
		this._anim.destroy();
		// remove listeners
		glow.events.removeAllListeners( [this] );
		this._tracks = undefined;
	};

	/**
		@private
		@function
		@description Moves a timeline forward onto timeline.position
			This deals with moving all the tracks forward from their
			current position to the new position. This is done on
			every frame, via timeline.goTo
	*/
	function moveForward(timeline) {
		var i = timeline._tracks.length,
			track,
			item,
			itemIndex,
			itemStart,
			timelinePosition = timeline.position;
		
		while (i--) {
			track = timeline._tracks[i];
			itemIndex = timeline._currentIndexes[i];

			while ( item = track[itemIndex] ) {
				itemStart = timeline._startPos[i][itemIndex];
				// deal with functions in the timeline
				if (typeof item === 'function') {
					item();
				}
				// deal with animations in the timeline
				else if (timelinePosition - itemStart >= item.duration) {
					// the animation we're currently playing has come to
					// an end, play the last frame and move on to the next
					item.goTo(item.duration).fire('complete');
					item.playing = false;
				}
				else {
					// the animation we're playing is somewhere in the middle
					if (!item.playing) {
						// ohh, we're just starting this animation
						item.fire('start');
						item.playing = true;
					}
					item.goTo(timelinePosition - itemStart);
					// we're not done with this item, break
					break;
				}
				itemIndex++;
			}
			timeline._currentIndexes[i] = itemIndex;
		}
	}
	
	/**
		@private
		@function
		@description
			This goes through all animations that start after the new position
			& before the previous position and calls their first frames.
	*/
	function moveBackward(timeline) {
		var i = timeline._tracks.length,
			j,
			track,
			item,
			itemStart,
			timelinePosition = timeline.position;
		
		while (i--) {
			track = timeline._tracks[i];
			j = timeline._currentIndexes[i] + 1;
			
			while (j--) {
				item = track[j];
				
				if (!item) {
					continue;
				}
				// we don't need to reset items before the new position,
				// their frames are rendered by 'moveForward'
				if ( timeline._startPos[i][j] < timeline.position ) {
					break;
				}
				// we only want to deal with animations
				if (typeof item !== 'function') {
					item.goTo(0);
				}
			}
			
			timeline._currentIndexes[i] = j;
		}
		
		// as a shortcut, we use 'moveForward' to trigger the frame for the new position
		// on the current items
		moveForward(timeline);
	}
	
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
	*/
	TimelineProto.goTo = function(pos) {
		var resetAll;
		if (pos > this.duration) {
			pos = this.duration;
		}
		else if (pos < 0) {
			pos = 0;
		}
		
		this.position = pos;
		
		(pos < this._lastPos) ? moveBackward(this) : moveForward(this);
		
		this._lastPos = pos;
		return this;
	};
	
	/**
		@private
		@description This method is applied to animations / timeline when they're adopted
	*/
	function methodNotAllowed() {
		throw new Error('Cannot call this method on items contained in a timeline');
	}
	
	/**
		@private
		@description Overwrite methods on animations / timelines that no longer apply
	*/
	function adoptAnim(anim) {
		anim.stop();
		anim.start = anim.stop = anim.destroy = anim.reverse = anim.pingPong = methodNotAllowed;
	}
	
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
	TimelineProto.track = function() {
		var args = arguments,
			tracksLen = this._tracks.length,
			track = this._tracks[tracksLen] = [],
			trackDuration = 0,
			trackDurations = this._startPos[tracksLen] = [],
			trackItem;
		
		// loop through the added tracks
		for (var i = 0, leni = args.length; i < leni; i++) {
			trackItem = track[i] = args[i];
			
			if (trackItem instanceof Anim || trackItem instanceof Timeline) {
				adoptAnim(trackItem);
			}
			// convert numbers into empty animations
			else if (typeof trackItem === 'number') {
				trackItem = track[i] = new Anim(trackItem);
			}
			// record the start time for this anim
			trackDurations[i] = trackDuration;
			trackDuration += trackItem.duration || 0;
		}
		
		// update duration and anim duration
		this._anim.duration = this.duration = Math.max(this.duration, trackDuration);
		this._currentIndexes[tracksLen] = 0;
		
		return this;
	};
	
	/**
		@name glow.anim.Timeline#event:start
		@event
		@description Fires when an animation starts.
			Preventing this event (by returning false or calling {@link glow.events.Event#preventDefault preventDefault})
			prevents this animation from starting.
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.anim.Timeline#event:frame
		@event
		@description Fires on each frame of the animation
		
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