// Add Sizzle to Glow
// This file is injected into sizzle.js by the ant "deps" target
Glow.provide(function(glow) {
	glow._sizzle = Sizzle;
});

return;
