"use strict";
const spawn = require("child_process");

switch (process.platform) {
        case "win32":
                module.exports = {
                        processSaveData: function() {
                                return spawn("cmd.exe", ["/c", "saveData.bat"]);
                        },
			userFile: "../skarmData/users.penguin",
			xkcdFile: "../skarmData/xkcd.penguin",
			guildFile: "../skarmData/guilds.penguin",
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
			userFile: "./skarmData/users.penguin",
			xkcdFile: "./skarmData/xkcd.penguin",
			guildFile: "./skarmData/guilds.penguin",
                };
                break;
        case "darwin": /* OSX */
        default:
                throw "unsupported platform (currently)";
                break;
}
