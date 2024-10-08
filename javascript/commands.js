const fs = require("fs");

module.exports = { };

let dir = fs.readdirSync("./javascript/commands/")
            .filter(filename => filename[0] != "_")
            .map(f => f.split(".")[0]);

for (let file of dir) {
    module.exports[file] = require("./commands/" + file);
}
console.log(`[Commands] Initialized ${Object.keys(module.exports).length} commands.`);
