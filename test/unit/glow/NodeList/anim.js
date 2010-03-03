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
	
	anim = glow('#positionTest').anim(0.5, {
		top: 50,
		left: 100
	});
	
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
	});
});

test('animating size with units', 4, function() {
	stop(2000);
	
	var nodeList = glow('#positionTest'),
		anim,
		heightLog = [],
		widthLog = [];
	
	anim = glow('#positionTest').anim(0.5, {
		height: '10%',
		width: '50%'
	}).on('frame', function() {
		heightLog.push( nodeList.css('height') );
		widthLog.push( nodeList.css('width') );
	}).on('complete', function() {
		equal(heightLog[0], '100px', 'height start position');
		equal(heightLog.slice(-1)[0], '30px', 'height end position');
		
		equal(widthLog[0], '100px', 'width start position');
		equal(widthLog.slice(-1)[0], '200px', 'width end position');
		
		start();
	});
});

test('animating colour', 2, function() {
	stop(2000);
	
	var nodeList = glow('#positionTest'),
		anim,
		colourLog = [];
	
	anim = glow('#positionTest').anim(0.5, {
		'background-color': 'aqua'
	}).on('frame', function() {
		colourLog.push( nodeList.css('background-color') );
	}).on('complete', function() {
		equal(colourLog[0], 'rgb(255, 0, 0)', 'height start value');
		equal(colourLog.slice(-1)[0], 'rgb(0, 255, 255)', 'height end value');
		
		start();
	});
});

// tween, loop, startNow
// does it work on all elements in the nodelist
// does opacity work in IE?

module('glow.NodeList#queueAnim', {setup:setup, teardown:teardown});

// TODO