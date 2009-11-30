woosh.addTests('proto-1603', {
	'body': function() {
		return $$('body').length;
	},
	'div': function() {
		return $$('div').length;
	},
	'body div': function() {
		return $$('body div').length;
	},
	'div p': function() {
		return $$('div p').length;
	},
	'div > p': function() {
		return $$('div > p').length;
	},
	'div + p': function() {
		return $$('div + p').length;
	},
	'div ~ p': function() {
		return $$('div ~ p').length;
	},
	'div[class^=exa][class$=mple]': function() {
		return $$('div[class^=exa][class$=mple]').length;
	},
	'div p a': function() {
		return $$('div p a').length;
	},
	'div, p, a': function() {
		return $$('div, p, a').length;
	},
	'.note': function() {
		return $$('.note').length;
	},
	'div.example': function() {
		return $$('div.example').length;
	},
	'ul .tocline2': function() {
		return $$('ul .tocline2').length;
	},
	'div.example, div.note': function() {
		return $$('div.example, div.note').length;
	},
	'#title': function() {
		return $$('#title').length;
	},
	'h1#title': function() {
		return $$('h1#title').length;
	},
	'div #title': function() {
		return $$('div #title').length;
	},
	'ul.toc li.tocline2': function() {
		return $$('ul.toc li.tocline2').length;
	},
	'ul.toc > li.tocline2': function() {
		return $$('ul.toc > li.tocline2').length;
	},
	'h1#title + div > p': function() {
		return $$('h1#title + div > p').length;
	},
	'h1[id]:contains(Selectors)': function() {
		return $$('h1[id]:contains(Selectors)').length;
	},
	'a[href][lang][class]': function() {
		return $$('a[href][lang][class]').length;
	},
	'div[class]': function() {
		return $$('div[class]').length;
	},
	'div[class=example]': function() {
		return $$('div[class=example]').length;
	},
	'div[class^=exa]': function() {
		return $$('div[class^=exa]').length;
	},
	'div[class$=mple]': function() {
		return $$('div[class$=mple]').length;
	},
	'div[class*=e]': function() {
		return $$('div[class*=e]').length;
	},
	'div[class|=dialog]': function() {
		return $$('div[class|=dialog]').length;
	},
	'div[class!=made_up]': function() {
		return $$('div[class!=made_up]').length;
	},
	'div[class~=example]': function() {
		return $$('div[class~=example]').length;
	},
	'div:not(.example)': function() {
		return $$('div:not(.example)').length;
	},
	'p:contains(selectors)': function() {
		return $$('p:contains(selectors)').length;
	},
	'p:nth-child(even)': function() {
		return $$('p:nth-child(even)').length;
	},
	'p:nth-child(2n)': function() {
		return $$('p:nth-child(2n)').length;
	},
	'p:nth-child(odd)': function() {
		return $$('p:nth-child(odd)').length;
	},
	'p:nth-child(2n+1)': function() {
		return $$('p:nth-child(2n+1)').length;
	},
	'p:nth-child(n)': function() {
		return $$('p:nth-child(n)').length;
	},
	'p:only-child': function() {
		return $$('p:only-child').length;
	},
	'p:last-child': function() {
		return $$('p:last-child').length;
	},
	'p:first-child': function() {
		return $$('p:first-child').length;
	}
});
