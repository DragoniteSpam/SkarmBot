"use strict";
const spawn = require("child_process");

const Constants = require("./constants.js");

switch (process.platform) {
	case "win32":
		module.exports = {
			spawn: spawn,
			Constants: Constants,
			processSaveData: function() {
				let savior = spawn.exec('cmd.exe', ['/c', 'saveData.bat']);
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
				return spawn.exec('cmd.exe', ['/c', 'pullData.bat']);
			},
		};
		break;
	case "linux":
		module.exports = {
			processSaveData: function() {
				let script = spawn.exec("sh saveData.sh", (err, stdout, stderr) => {
					// eat the output
				});
				return script;
			},
			pullData: function() {
				let script = spawn.exec("sh pullData.sh", (err, stdout, stderr) => {
					// eat the output
				});
				return script;
			},
		};
		break;
	case "darwin": /* OSX */
	default:
		throw "unsupported platform (currently), unless you want to write code to deal with it";
		break;
}
