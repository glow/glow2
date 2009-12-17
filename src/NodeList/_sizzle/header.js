Glow.provide(function(glow) {
	// use this to catch sizzle's global var,
	// thankfully it only makes one reference to window
	var window = {};