"use strict";
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

/**
 * Guild data is assumed to be moving too rapidly to be able to safely operate on it
 */
module.exports = {
    aliases: ["hotswap"],
    params: [],
    usageChar: "@",
    helpText: "Debug command to reload user data to files, unencrypted.  Only for use in extreme circumstances",
    examples: [
        { command: "e@hotswap", effect: "Loads user data from `./debug/`." }
    ],
    ignoreHidden: false,
    perms: Permissions.MOM,
    category: "infrastructure",

    execute(bot, e, userData, guildData) {
        bot.loadDebug();

        Skarm.sendMessageDelay(e.message.channel, "Reloaded the debug things!");
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

