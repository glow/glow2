function byId(id) {
	return document.getElementById(id);
}

var testHtml;

function setup() {
	testHtml = byId('testElmsContainer').innerHTML;
}

function teardown() {
	byId('testElmsContainer').innerHTML = testHtml;
}

module('glow.NodeList#anim', {setup:setup, teardown:teardown});

test('animating position', 6, function() {
	stop(2000);
	
	var nodeList = glow('#positionTest'),
		anim,
		topLog = [],
		leftLog = [];
	
	equals(typeof nodeList.anim, 'function', '#anim exists');
	
	// defer the start of the animation so we pick up the first frame
	anim = nodeList.anim(0.5, {
		top: 50,
		left: 100
	}, {startNow:false});
	
	equals(anim.constructor, glow.anim.Anim, '#anim returns glow.anim.Anim');
	
	anim.on('frame', function() {
		topLog.push( nodeList.css('top') );
		leftLog.push( nodeList.css('left') );
	}).on('complete', function() {
		equal(topLog[0], '10px', 'top start position');
		equal(topLog.slice(-1)[0], '50px', 'top end position');
		
		equal(leftLog[0], '5px', 'left start position');
		equal(leftLog.slice(-1)[0], '100px', 'left end position');
		
		start();
	}).start();
});

test('animating size with units', 4, function() {
	stop(2000);
	
	var nodeList = glow('#positionTest'),
		anim,
		heightLog = [],
		widthLog = [];
	
	anim = nodeList.anim(0.5, {
		height: '10%',
		width: '50%'
	}, {startNow:false}).on('frame', function() {
		heightLog.push( nodeList.css('height') );
		widthLog.push( nodeList.css('width') );
	}).on('complete', function() {
		equal(heightLog[0], '100px', 'height start position');
		equal(heightLog.slice(-1)[0], '30px', 'height end position');
		
		equal(widthLog[0], '100px', 'width start position');
		equal(widthLog.slice(-1)[0], '200px', 'width end position');
		
		start();
	}).start();
});

test('animating colour', 2, function() {
	stop(2000);
	
	var nodeList = glow('#positionTest'),
		anim,
		colourLog = [];
	
	anim = nodeList.anim(0.5, {
		'background-color': 'aqua'
	}, {startNow:false}).on('frame', function() {
		colourLog.push( nodeList.css('background-color') );
	}).on('complete', function() {
		equal(colourLog[0], 'rgb(255, 0, 0)', 'color start value');
		equal(colourLog.slice(-1)[0], 'rgb(0, 255, 255)', 'oolor end value');
		
		start();
	}).start();
});

test('animating space separated values & from values', 2, function() {
	stop(2000);
	
	var nodeList = glow('#positionTest'),
		anim,
		marginLog = [];
	
	anim = nodeList.anim(0.5, {
		'margin': ['0px 0px 10px 10px', '10px 50px 5px 15px']
	}, {startNow:false}).on('frame', function() {
		marginLog.push( nodeList.css('margin-top') + ' ' + nodeList.css('margin-right') + ' ' + nodeList.css('margin-bottom') + ' ' + nodeList.css('margin-left') );
	}).on('complete', function() {
		equal(marginLog[0], '0px 0px 10px 10px', 'start value');
		equal(marginLog.slice(-1)[0], '10px 50px 5px 15px', 'end value');
		
		start();
	}).start();
});

test('auto-starting, tweens and looping', 2, function() {
	stop(2000);
	
	function customTween(t) { return t; }
	
	var loopCount = 2,
		nodeList = glow('#positionTest'),
		anim = nodeList.anim(0.25, {
			height: 0
		}, {
			loop: true,
			tween: customTween
		}).on('complete', function() {
			if (!loopCount) {
				ok(true, 'Looping works');
				start();
			}
			firstFrame = true;
			if (!loopCount--) {
				this.loop = false;
			}
		});
	
	equal(anim.tween, customTween, 'Tween set');
});

test('Avoiding negative values', 1, function() {
	stop(2000);

	var valueLog = [],
		nodeList = glow('#positionTest');
		
	nodeList.anim(0.5, {
		height: [70, 0]
	}, {
		tween: 'elasticOut'
	}).on('frame', function() {
		valueLog.push( nodeList.css('height') )
	}).on('complete', function() {
		equal(valueLog.join('').indexOf('100px'), -1, 'Height is never 100px');
		start();
	});
});

// avoiding negative vals
// does it work on all elements in the nodelist
// does opacity work in IE?

module('glow.NodeList#queueAnim', {setup:setup, teardown:teardown});

// TODO