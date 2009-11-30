woosh.addTests('yui-300', {
	
	"make" : function(){	
		var ul, i;
		for ( i = 0; i < 250; i++ ) {
			ul = Y.Node.create('<ul></ul>');
			ul.addClass('fromcode');
			ul.set('id', 'setid'+i).set('innerHTML', '<li>one</li><li>two</li><li>three</li>');
			Y.get('body').appendChild(ul);
		}
		return Y.all('ul.fromcode').size();
	},
	
	"indexof" : function(){
		// can we do better here? This isn't pretty
		var target, item, index, i;
		for ( i = 0; i < 20; i++ ) {
			item = 0;
			index = 0;
			target = Y.get('#setid150');
			Y.all('ul').each(function(n){
				if ( n.compareTo(target) ) {
					index = item;
				}
				item ++;
			});
		}
		return index;
	},
	
	"bind" : function(){
		var subscriber = function(){};
		return Y.all('ul > li').on('click', subscriber).length;
	},
	
	"attr" : function(){
		return Y.all('ul').get('id').length;
	},
	
	"bindattr" : function(){
		var nodes = Y.all('ul > li'),
			subscriber = function(){};
		nodes.on('mouseover', subscriber);
		nodes.set('rel', 'touched');
		nodes.detach('mouseover', subscriber);
		return nodes.size();
	},

	"table": function(){
		var table, i;
		for ( i = 0; i < 40; i++ ) {
			table = Y.Node.create('<table class="madetable"></table>');
			Y.get('body').appendChild(table);
			table.set('innerHTML', '<tr><td>first</td></tr>');
			table.query('td').get('parentNode').insertBefore(Y.Node.create('<td></td>'));
		}
		return Y.all('tr td').size();
	},
	
	"addanchor" : function(){
		return Y.all('.fromcode > li').set('innerHTML', '<a href="http://example.com">link</a>').length;
	},

	"append" : function(){
		// Selector failing on "div[rel^='foo2']"
		for ( var i = 0; i < 500; i++ ) {
			Y.get('body').appendChild(Y.Node.create('<div rel="foo2"></div>'));
		}
		return Y.all("div[rel^='foo2']").size();
	},
	
	"addclass-odd" : function(){
		// using ':nth-child(even)' because others start counting at 0
		var divs = Y.all('div'),
			odds = [],
			i = 0;
		divs.addClass('added');
		divs.each(function(div){
			if ( i % 2 === 1 ) {
				odds.push(div.addClass('odd'));
			}
			i++;
		});
		return odds.length;
	},
	
	"style": function(){
		return Y.all('.added').setStyles({ 'background-color':'#ededed', 'color':'#fff' }).length;
	},
	
	"removeclass": function(){
		return Y.all('.added').removeClass('added').length;
	},
	
	"sethtml": function(){
		Y.all('div').set('innerHTML', '<p>new content</p>');
		return Y.all('div').length;
	},
	
	"insertbefore" : function(){
		return Y.all('.fromcode a').insertBefore(Y.Node.create('<p>A Link</p>')).length;
	},
	
	"insertafter" : function(){
		return Y.all('.fromcode a').appendChild(Y.Node.create('<p>After Link</p>')).length;
	},
	
	"destroy": function(){ 
		var nodes = Y.all('.fromcode');
		nodes.each(function(node){
			node.get('parentNode').removeChild(node);
		});
		return nodes.size();
	},
	
	"finale": function(){
		var body = Y.get('body'),
			nodes;
		body.set('innerHTML', '');
		nodes = Y.all('body *');
		return (nodes ? nodes.size() : 0);
	}
	
});
