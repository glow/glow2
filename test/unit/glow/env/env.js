module('glow.env');

test("glow.env", 3, function() {
	var found = false;
	
	if (glow.env.gecko) {
		ok(typeof glow.env.gecko == "number", "Gecko detected: " + glow.env.gecko);
		found = true;
	}
	if (glow.env.ie) {
		ok(typeof glow.env.ie == "number", "IE detected: " + glow.env.ie);
		found = true;
	}
	if (glow.env.opera) {
		ok(typeof glow.env.opera == "number", "Opera detected: " + glow.env.opera);
		found = true;
	}
	if (glow.env.webkit) {
		ok(typeof glow.env.webkit == "number", "Webkit detected: " + glow.env.webkit);
		found = true;
	}
	if (glow.env.khtml) {
		ok(typeof glow.env.khtml == "number", "KHTML detected: " + glow.env.khtml);
		found = true;
	}
	if (!found) {
		ok(false, "Browser unknown");
	}
	
	ok(glow.env.version && typeof glow.env.version == "string", "Version populated: '" + glow.env.version + "'");
	ok(glow.env.standardsMode, "Page detected as standards mode");
})