"use strict";
const spawn = require("child_process");

const Constants = require("./constants.js");

switch (process.platform) {
	case "win32":
		module.exports = {
			processSaveData: function() {
				let savior = spawn('cmd.exe', ['/c', 'saveData.bat']);
				savior.on('exit', (code) => {
					console.log("Received code: " + code + " on saving data.");
					if (saveCode === Constants.SaveCodes.DONOTHING)
						return;
					if (saveCode === undefined)
						return;
					setTimeout(() => {
						this.client.disconnect();
						process.exit(saveCode);
					}, 2000);
				});
			},
			pullData: function() {
				return spawn('cmd.exe', ['/c', 'pullData.bat']);
			},
		};
		break;
	case "linux":
		module.exports = {
			processSaveData: function() {
				let script = spawn("sh", ["-c", "saveData.sh"]);
				script.stdout.on("data", (data) => {
					// eat the standard output
				});
				return script;
			},
			pullData: function() {
				// dont do anythingn for now
				return undefined;
			},
		};
		break;
	case "darwin": /* OSX */
	default:
		throw "unsupported platform (currently), unless you want to write code to deal with it";
		break;
}
