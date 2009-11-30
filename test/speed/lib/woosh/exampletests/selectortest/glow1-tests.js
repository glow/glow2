woosh.addTests('glow-170', {
	'body': function() {
		return glow.dom.get('body').length;
	},
	'div': function() {
		return glow.dom.get('div').length;
	},
	'body div': function() {
		return glow.dom.get('body div').length;
	},
	'div p': function() {
		return glow.dom.get('div p').length;
	},
	'div > p': function() {
		return glow.dom.get('div > p').length;
	},
	'div + p': function() {
		return glow.dom.get('div + p').length;
	},
	'div ~ p': function() {
		return glow.dom.get('div ~ p').length;
	},
	'div[class^=exa][class$=mple]': function() {
		return glow.dom.get('div[class^=exa][class$=mple]').length;
	},
	'div p a': function() {
		return glow.dom.get('div p a').length;
	},
	'div, p, a': function() {
		return glow.dom.get('div, p, a').length;
	},
	'.note': function() {
		return glow.dom.get('.note').length;
	},
	'div.example': function() {
		return glow.dom.get('div.example').length;
	},
	'ul .tocline2': function() {
		return glow.dom.get('ul .tocline2').length;
	},
	'div.example, div.note': function() {
		return glow.dom.get('div.example, div.note').length;
	},
	'#title': function() {
		return glow.dom.get('#title').length;
	},
	'h1#title': function() {
		return glow.dom.get('h1#title').length;
	},
	'div #title': function() {
		return glow.dom.get('div #title').length;
	},
	'ul.toc li.tocline2': function() {
		return glow.dom.get('ul.toc li.tocline2').length;
	},
	'ul.toc > li.tocline2': function() {
		return glow.dom.get('ul.toc > li.tocline2').length;
	},
	'h1#title + div > p': function() {
		return glow.dom.get('h1#title + div > p').length;
	},
	'h1[id]:contains(Selectors)': function() {
		return glow.dom.get('h1[id]:contains(Selectors)').length;
	},
	'a[href][lang][class]': function() {
		return glow.dom.get('a[href][lang][class]').length;
	},
	'div[class]': function() {
		return glow.dom.get('div[class]').length;
	},
	'div[class=example]': function() {
		return glow.dom.get('div[class=example]').length;
	},
	'div[class^=exa]': function() {
		return glow.dom.get('div[class^=exa]').length;
	},
	'div[class$=mple]': function() {
		return glow.dom.get('div[class$=mple]').length;
	},
	'div[class*=e]': function() {
		return glow.dom.get('div[class*=e]').length;
	},
	'div[class|=dialog]': function() {
		return glow.dom.get('div[class|=dialog]').length;
	},
	'div[class!=made_up]': function() {
		return glow.dom.get('div[class!=made_up]').length;
	},
	'div[class~=example]': function() {
		return glow.dom.get('div[class~=example]').length;
	},
	'div:not(.example)': function() {
		return glow.dom.get('div:not(.example)').length;
	},
	'p:contains(selectors)': function() {
		return glow.dom.get('p:contains(selectors)').length;
	},
	'p:nth-child(even)': function() {
		return glow.dom.get('p:nth-child(even)').length;
	},
	'p:nth-child(2n)': function() {
		return glow.dom.get('p:nth-child(2n)').length;
	},
	'p:nth-child(odd)': function() {
		return glow.dom.get('p:nth-child(odd)').length;
	},
	'p:nth-child(2n+1)': function() {
		return glow.dom.get('p:nth-child(2n+1)').length;
	},
	'p:nth-child(n)': function() {
		return glow.dom.get('p:nth-child(n)').length;
	},
	'p:only-child': function() {
		return glow.dom.get('p:only-child').length;
	},
	'p:last-child': function() {
		return glow.dom.get('p:last-child').length;
	},
	'p:first-child': function() {
		return glow.dom.get('p:first-child').length;
	}
});
