"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["write"],
        params: [],
        usageChar: "@",
        helpText: "Debug command to write the user and guild data to files, unencrypted.",
        examples: [
            {command: "e@write", effect: "Saves data to `./debug/`."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            bot.saveDebug();
            
            Skarm.sendMessageDelay(e.message.channel, "Saved the debug things!");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

