const os = require("os");
const request = require("request");

const Skarm = require("../skarm.js");
const Constants = require("../constants.js");
const Web = require("../web.js");
const Users = require("../user.js");
const Guilds = require("../guild.js");
const Permissions = require("../permissions.js");
const Skinner = require("../skinnerbox.js");

const SarGroups = require("../guildClasses/sar.js");
const { ShantyCollection } = require("../shanties");

Constants.initialize();     // if this line isn't here, local initialization of constants in "effect" fields break

module.exports = {
    os: os,
    request: request,
    Skarm: Skarm,
    Constants: Constants,
    Web: Web,
    Users: Users,
    Guilds: Guilds,
    Permissions: Permissions,
    Skinner: Skinner,
    SarGroups: SarGroups,
    ShantyCollection: ShantyCollection
}
