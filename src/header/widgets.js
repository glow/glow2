if (!window.Glow) { // loading packages via user SCRIPT tags?
	throw new Error('Cannot load widgets.js before core.js');
}
