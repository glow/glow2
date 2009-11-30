woosh.addTests('glow-170', {
	
	"make": function(){
		for(var i = 0; i<250; i++){
			glow.dom.create("<ul id='setid" + i + "' class='fromcode'></ul>")
				.append("<li>one</li><li>two</li><li>three</li>")
				.appendTo("body");
		}
		return glow.dom.get("ul.fromcode").length;
	},
	
	"indexof" : function(){
		var target, item, index, i;
		for ( i = 0; i < 20; i++ ) {
			index = 0;
			target = glow.dom.get("#setid150")[0];
			glow.dom.get('ul').each(function(n){
				if ( this == target ) {
					index = n;
				}
			});
		}
		return index;
	},
	
	"bind" : function(){
		var lis = glow.dom.get('ul > li');
		glow.events.addListener(lis, 'click', function(){});
		return lis.length;
	},
	
	"attr" : function(){
		var uls = glow.dom.get("ul");
		var ids = glow.lang.map(uls, function(ul) {
			return ul.id;
		});
		return ids.length;
	},
	
	"bindattr" : function(){
		var func = function(){};
		return glow.dom.get('ul > li').each( function() {
			glow.events.addListener(this, 'mouseover', func);
			glow.dom.get(this).attr('rel', 'touched');
			glow.events.removeListener(this, 'mouseover', func);
		}).length;
	},

	"table": function(){
		for(var i = 0; i < 40; i++){
		  glow.dom.create("<table class='madetable'></table>")
			.appendTo("body")
			.html("<tr><td>first</td></tr>")
			.get("tr").prepend("<td>before</td>");
		}
		return glow.dom.get("tr td").length;
	},
	
	"addanchor" : function(){
		return glow.dom.get(".fromcode > li").append("<a href='http://example.com'>link</a>").length;
	},
	
	"append": function(){
		for(var i = 0; i<500; i++){
			glow.dom.get("body").append("<div rel='foo2'>test</div>");
		}
		return glow.dom.get("div").filter( function(){
			return glow.dom.get(this).attr("rel") === "foo2";
		}).length;
	},
		
	"addclass-odd" : function(){
		var odds = glow.dom.get('div')
			.addClass("added")
			.filter(function(i){
				return i % 2 === 1;
			})
			.addClass("odd");
		return odds.length;
	},
	
	"style" : function(){
		return glow.dom.get(".added").css({ backgroundColor:"#ededed", color:"#fff" }).length;
	},

	"removeclass" : function(){
		return glow.dom.get(".added").removeClass("added").length;
	},
	
	"sethtml": function(){
		glow.dom.get("div").html("<p>new content</p>");
		return glow.dom.get("div").length;
	},
	
	"insertbefore" : function(){
		return glow.dom.get(".fromcode a").before("<p>A Link</p>").length;
	},
	
	"insertafter" : function(){
		return glow.dom.get(".fromcode a").after("<p>After Link</p>").length;
	},
	
	"destroy": function(){
		return glow.dom.get(".fromcode").remove().length;
	},
	
	"finale": function(){
		glow.dom.get("body").empty();
		return glow.dom.get("body *").length;
	}
	
});