"use strict";
const spawn = require("child_process");

switch (process.platform) {
	case "win32":
		module.exports = {
			WINDOWS: true,
			LINUX: false,
			OSX: false,
			processSaveData: function() {
				return spawn("cmd.exe", ["/c", "saveData.bat"]);
			},
		};
		break;
	case "linux":
		module.exports = {
			WINDOWS: false,
			LINUX: true,
			OSX: false,
			processSaveData: function() {
				let script = spawn("sh", ["-c", "saveData.sh"]);
				script.stdout.on("data", (data) => {
					// eat the standard output
				});
				return script;
			},
		};
		break;
	case "darwin": /* OSX */
	default:
		throw "unsupported platform (currently)";
		break;
}
