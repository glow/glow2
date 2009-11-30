woosh.addTests('dojo-132', {
	'body': function(test) {
		return dojo.query('body').length;
	},
	'div': function() {
		return dojo.query('div').length;
	},
	'body div': function() {
		return dojo.query('body div').length;
	},
	'div p': function() {
		return dojo.query('div p').length;
	},
	'div > p': function() {
		return dojo.query('div > p').length;
	},
	'div + p': function() {
		return dojo.query('div + p').length;
	},
	'div ~ p': function() {
		return dojo.query('div ~ p').length;
	},
	'div[class^=exa][class$=mple]': function() {
		return dojo.query('div[class^=exa][class$=mple]').length;
	},
	'div p a': function() {
		return dojo.query('div p a').length;
	},
	'div, p, a': function() {
		return dojo.query('div, p, a').length;
	},
	'.note': function() {
		return dojo.query('.note').length;
	},
	'div.example': function() {
		return dojo.query('div.example').length;
	},
	'ul .tocline2': function() {
		return dojo.query('ul .tocline2').length;
	},
	'div.example, div.note': function() {
		return dojo.query('div.example, div.note').length;
	},
	'#title': function() {
		return dojo.query('#title').length;
	},
	'h1#title': function() {
		return dojo.query('h1#title').length;
	},
	'div #title': function() {
		return dojo.query('div #title').length;
	},
	'ul.toc li.tocline2': function() {
		return dojo.query('ul.toc li.tocline2').length;
	},
	'ul.toc > li.tocline2': function() {
		return dojo.query('ul.toc > li.tocline2').length;
	},
	'h1#title + div > p': function() {
		return dojo.query('h1#title + div > p').length;
	},
	'h1[id]:contains(Selectors)': function() {
		return dojo.query('h1[id]:contains(Selectors)').length;
	},
	'a[href][lang][class]': function() {
		return dojo.query('a[href][lang][class]').length;
	},
	'div[class]': function() {
		return dojo.query('div[class]').length;
	},
	'div[class=example]': function() {
		return dojo.query('div[class=example]').length;
	},
	'div[class^=exa]': function() {
		return dojo.query('div[class^=exa]').length;
	},
	'div[class$=mple]': function() {
		return dojo.query('div[class$=mple]').length;
	},
	'div[class*=e]': function() {
		return dojo.query('div[class*=e]').length;
	},
	'div[class|=dialog]': function() {
		return dojo.query('div[class|=dialog]').length;
	},
	'div[class!=made_up]': function() {
		return dojo.query('div[class!=made_up]').length;
	},
	'div[class~=example]': function() {
		return dojo.query('div[class~=example]').length;
	},
	'div:not(.example)': function() {
		return dojo.query('div:not(.example)').length;
	},
	'p:contains(selectors)': function() {
		return dojo.query('p:contains(selectors)').length;
	},
	'p:nth-child(even)': function() {
		return dojo.query('p:nth-child(even)').length;
	},
	'p:nth-child(2n)': function() {
		return dojo.query('p:nth-child(2n)').length;
	},
	'p:nth-child(odd)': function() {
		return dojo.query('p:nth-child(odd)').length;
	},
	'p:nth-child(2n+1)': function() {
		return dojo.query('p:nth-child(2n+1)').length;
	},
	'p:nth-child(n)': function() {
		return dojo.query('p:nth-child(n)').length;
	},
	'p:only-child': function() {
		return dojo.query('p:only-child').length;
	},
	'p:last-child': function() {
		return dojo.query('p:last-child').length;
	},
	'p:first-child': function() {
		return dojo.query('p:first-child').length;
	}
});
