woosh.addTests('proto-1603', {
	
	"make" : function(){
		var fromcode;
		for (var i = 0; i < 250; i++) {
			fromcode = new Element('ul', { 'class': 'fromcode', id: "setid" + i });
			$w('one two three').each( function(word){
		  		fromcode.appendChild(new Element('li').update(word));
			});
			document.body.appendChild(fromcode);
		}  
		return $$('ul.fromcode').length;	  
	},
	
	"indexof" : function(){
		var index, node, uls;
		for (var i = 0; i < 20; i++) {
			node = $('setid150');
			uls = $$('ul');
			index = uls.indexOf(node);
		}
	  
		return index;
	},
	
	"bind" : function(){
		var LIs = $$('ul > li');
		LIs.invoke('observe', 'click', Prototype.emptyFunction);
		return LIs.length;
	},
	
	"attr" : function(){
		return $$('ul').pluck('id').length;
	},
	
	"bindattr" : function(){
		var LIs = $$('ul > li');
		LIs.each( function(li) {
			li.observe('mouseover', Prototype.emptyFunction);
			li.writeAttribute('rel', 'touched');
			li.stopObserving('mouseover', Prototype.emptyFunction);
		});
	  
		return LIs.length;	  
	},

	"table": function(){
		var table, tr;
		for (var i = 0; i < 40; i++) {
			table = new Element('table', { 'class': 'madetable' });
			document.body.appendChild(table);

			tr = new Element('tr');
			tr.appendChild(new Element('td'));

			table.appendChild(tr);

			tr.insert({ top: new Element('td') });		
		}
	  
		return $$('tr td').length;
	},
	
	"addanchor" : function(){
		var LIs = $$('.fromcode > li');
		LIs.each( function(li) {
			li.appendChild(new Element('a', { href: 'http://example.com' }).update('link'));
		});
		return LIs.length;	  
	},
		
	"append" : function(){
	  for (var i = 0; i < 500; i++) {
		document.body.appendChild(new Element('div', { rel: 'foo2' }));
	  }
	  
	  return $$("[rel^='foo2']").length;
	},
	
	"addclass-odd" : function(){
	  var divs = $$('body div'), oddDivs = [];
	  
	  divs.each(function(div, index) {
		div.addClassName('added');
		if (index % 2 === 1) {
		  div.addClassName('odd');
		  oddDivs.push(div);
		}
	  });
	  
	  return oddDivs.length;
	},
	
	"style": function(){
		var nodes = $$('.added');  
		nodes.invoke('setStyle', {
			backgroundColor: '#ededed',
			color: '#fff'
		});
		return nodes.length;
	},
		
	"removeclass": function(){
		var nodes = $$('.added');
		nodes.invoke('removeClassName', 'added');
	  
		return nodes.length;
	},
	
	"sethtml": function(){
		var divs = $$('div');
		divs.invoke('update', "<p>new content</p>");
		return $$("div").length;
	},
	
	"sethtml-alt" : function(){
	  var nodes = $$('.odd').select( function(node, i) { return i % 50 === 0; });
	  nodes.invoke("update", "<p>alt content</p>");
	  return nodes.length;	  
		// find all nodes with the class "odd"
		// reduce that list with a modulo of 50
		//		(eg: Array.filter(function(n,i){ return i % 50 === 0 })))
		// set the content of the matches to "<p>alt content</p>"
		//
		// retun the length of the reduced matches
	},
	
	"insertbefore" : function(){
		var anchors = $$('.fromcode a');
	  
		anchors.each( function(anchor) {
			anchor.insert({ before: new Element('p').update("A Link") });
		});
		return anchors.length;	  
	},
	
	"insertafter" : function(){
		var anchors = $$(".fromcode a");
		anchors.each( function(anchor) {
			anchor.insert({ after: new Element('p').update("After Link") });
		}).length;
	},
	
	"destroy": function(){ 
		return $$(".fromcode").each(Element.remove).length;
	},
	
	"finale": function(){
	  $(document.body).descendants().each(Element.remove);
	  return $$("body *").length;
	}
	
});
