woosh.addTests('yui-270', {
	
	"make" : function(){
		var ul;
		for ( var i = 0; i < 250; i++ ) {
			ul = document.createElement('ul');
			YAHOO.util.Dom.addClass(ul, 'fromcode');
			YAHOO.util.Dom.setAttribute(ul, 'id', 'setid'+i);
			document.body.appendChild(ul);
			ul.innerHTML = '<li>one</li><li>two</li><li>three</li>';
		}
		return YAHOO.util.Selector.query('ul.fromcode').length;
	},
	
	"indexof" : function(){
		// No indexof method for arrays in YUI
		var target, uls, index, i, j, len;
		for ( i = 0; i < 20; i++ ) {
			target = YAHOO.util.Dom.get('setid150');
			uls = YAHOO.util.Selector.query('ul');
			index = 0;
			for ( j = 0, len = uls.length; j < len; j++ ) {
				if ( uls[j] === target ) {
					index = j;
					break;
				}
			}
		}
		return index;
	},
	
	"bind" : function(){
		var lis = YAHOO.util.Selector.query('ul > li');
		YAHOO.util.Event.on(lis, 'click', function(){});
		return lis.length;
	},
	
	"attr" : function(){
		return YAHOO.util.Dom.batch(YAHOO.util.Selector.query('ul'), function(el){
			return YAHOO.util.Dom.getAttribute(el, 'id');
		}).length;
	},
	
	"bindattr" : function(){
		var lis = YAHOO.util.Selector.query('ul > li'),
			subscriber = function(){};
		return YAHOO.util.Dom.batch(lis, function(li){
			YAHOO.util.Event.on(li, 'mouseover', subscriber);
			YAHOO.util.Dom.setAttribute(li, 'rel', 'touched');
			YAHOO.util.Event.removeListener(li, 'mouseover', subscriber);
		}).length;
	},

	"table": function(){
		// Making sure to help IE with DOM manipulation wrt tables
		var _, table, i;
		for ( i = 0; i < 40; i++ ) {
            _ = document.createElement('div');
            _.innerHTML = '<table class="madetable"><tbody><tr><td>first</td></tr></tbody></table>';
			table = _.getElementsByTagName('table')[0];
			document.body.appendChild(table);
			YAHOO.util.Dom.insertBefore(
                document.createElement('td'),
                table.getElementsByTagName('td')[0]);
		}
		return YAHOO.util.Selector.query('tr td').length;
	},
	
	"addanchor" : function(){
		return YAHOO.util.Dom.batch(YAHOO.util.Selector.query('.fromcode > li'), function(li){
			li.innerHTML = '<a href="http://example.com">link</a>';
		}).length;
	},

	"append" : function(){
		var div;
		for ( var i = 0; i < 500; i++ ) {
			div = document.createElement('div');
			YAHOO.util.Dom.setAttribute(div, 'rel', 'foo2');
			document.body.appendChild(div);
		}
		return YAHOO.util.Selector.query("div[rel^='foo2']").length;
	},
	
	"addclass-odd" : function(){
		var divs = YAHOO.util.Selector.query('div'),
			// odds = YAHOO.util.Selector.filter(divs, ':nth-child(even)'),
			odds = [],
			i;
		YAHOO.util.Dom.addClass(divs, 'added');
		for ( i = 0; i < divs.length; i++ ) { // like dojo 1.3
			if ( i % 2 === 1 ) {
				odds.push(divs[i]);
			}
		}
		YAHOO.util.Dom.addClass(odds, 'odd');
		return odds.length;
	},
	
	"style": function(){
		var nodes = YAHOO.util.Dom.getElementsByClassName('added');
        YAHOO.util.Dom.setStyle(nodes, 'background-color', '#ededed');
        YAHOO.util.Dom.setStyle(nodes, 'color', '#fff');
		return nodes.length;
	},
	
	"removeclass": function(){
		var nodes = YAHOO.util.Dom.getElementsByClassName('added');
		YAHOO.util.Dom.removeClass(nodes, 'added');
		return nodes.length;
	},
	
	"sethtml": function(){
		YAHOO.util.Dom.batch(YAHOO.util.Selector.query('div'), function(div){
			div.innerHTML = '<p>new content</p>';
		});
		return YAHOO.util.Selector.query("div").length;
	},
	
	"insertbefore" : function(){
		return YAHOO.util.Dom.batch(YAHOO.util.Selector.query('.fromcode a'), function(a){
			var p = document.createElement('p');
			p.innerHTML = 'A Link';
			YAHOO.util.Dom.insertBefore(p,a);
		}).length;
	},
	
	"insertafter" : function(){
		return YAHOO.util.Dom.batch(YAHOO.util.Selector.query('.fromcode a'), function(a){
			var p = document.createElement('p');
			p.innerHTML = 'After Link';
			YAHOO.util.Dom.insertAfter(p,a);
		}).length;
	},
	
	"destroy": function(){ 
		return YAHOO.util.Dom.batch(YAHOO.util.Selector.query('.fromcode'), function(n){
			n.parentNode.removeChild(n);
		}).length;
	},
	
	"finale": function(){
		var body = document.body;
		while ( body.firstChild ) {
			body.removeChild(body.firstChild);
		}
		return YAHOO.util.Selector.query('body *').length;
	}
	
});
