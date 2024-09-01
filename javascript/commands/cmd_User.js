"use strict";
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

module.exports = {
    aliases: ["user"],
    params: [],
    usageChar: "@",
    helpText: "Prints all of your profile data",
    examples: [
        { command: "e@user", effect: "Skarm sends you your profile data in whole" }
    ],
    ignoreHidden: false,
    perms: Permissions.MOM,
    category: "infrastructure",

    execute(bot, e, userData, guildData) {
        Skarm.sendMessageDelay(e.message.channel, "```" + JSON.stringify(userData, null, 4) + "```");
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

