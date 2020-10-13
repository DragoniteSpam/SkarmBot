"use strict";

switch (process.platform) {
	case "win32":
		break;
	case "linux":
		break;
	case "darwin": /* OSX */
	default:
		throw "unsupported platform (currently)";
		break;
}
