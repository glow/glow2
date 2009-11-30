woosh.addTests('moo-122', {
	
	"make": function(){
		for(var i = 0; i<250; i++){
			
			new Element('ul', { id:'setid'+i, 'class':'fromcode'})
				.adopt(
					new Element('li', { html:'one' }),
					new Element('li', { html:'two' }),
					new Element('li', { html:'three' })
				)
				.inject(document.body)
			;
		}
		return $$('ul.fromcode').length;
	},
	
	"indexof": function(){
		var id,ul,index;
		for(var i = 0; i<20; i++){
			id = $('setid150');
			index = $$('ul').indexOf(id);
		}
		return index;
	},
	
	"bind": function(){
		return $$('ul > li').addEvent('click', $empty).length;
	},
	
	"attr": function(){
		return $$('ul').get('id').length;
	},
	
	"bindattr": function(){
		return $$('ul > li').map(function(el){
			return el.addEvent('mouseover', $empty).set('rel','touched').removeEvent('mouseover', $empty);
		}).length;
	},

	"table": function(){
		for(var i = 0; i<40; i++){
			
			new Element('table',{ 'class':'madetable' })
				.inject(document.body)
				.grab(
					new Element('tr')
						.grab( new Element('td',{ html:'first' }) )
						.grab( new Element('td'), 'top')
				)
			;
		}
		return $$('tr td').length;
	},
	
	"addanchor": function(){
		return $$('ul.fromcode > li').map(function(el){
			return el.grab(new Element('a',{ html:'link', href:'http://example.com' }));
		}).length;
	},

	"alt-add": function(){
		return $$('ul.fromcode > li').map(function(el){
			return el.grab(new Element('a',{ html:'link', href:'http://example.com' }));
		}).length;
	},
	
	"create": function(){
		for (var i = 0; i<500; i++){
			$(document.body).grab(new Element('div', {rel: 'foo', html: 'test'}));
		}
		return $$("[rel^='foo']").length;
	},
	
	"append": function(){
		for (var i = 0; i<500; i++){
			$(document.body).grab(new Element('div', {rel: 'foo2'}));
		}
		return $$('div[rel^="foo2"]').length;
	},
	
	"addclass-odd": function(){
		return $$('div').filter(function(d, i){
			d.addClass('added');
			if (i % 2) return d.addClass('odd');
		}).length;
	},
	
	"style": function(){
		return $$('div.added').setStyles({ 'background-color':'#ededed', color:'#fff' }).length;
	},
	
	"confirm-added": function(){
		return $$('div.added').length;
	},
	
	"removeclass": function(){
		return $$('div.added').removeClass('added').length;
	},
	
	"sethtml": function(){
		$$('div').set('html', "<p>new content</p>");
		return $$("div").length;
	},
	
	"sethtml-alt": function(){
		return $$('div.odd').filter(function(div,i){
			if (i % 50 === 1) return div.set('html', "<p>alt content</p>");
		}).length;
	},
	
	"insertbefore": function(){
		return $$('ul.fromcode a').map(function(a){
			new Element('p', {html: 'A Link'}).injectBefore(a);
		}).length;
	},
	
	"insertafter": function(){
		return $$('ul.fromcode a').map(function(a){
			new Element('p', {html: 'A Link'}).injectAfter(a);
		}).length;
	},
	
	"destroy": function(){ 
		return $$('ul.fromcode').dispose().length;
	},
	
	"finale": function(){
		$$('body *').dispose();
		return $$('body *').length;
	}
	
});
