"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["poll"],
        params: ["target"],
        usageChar: "@",
        helpText: "Polls a comic or all comics.",
        examples: [{command: "e!ping", effect: "Skarm will send a message, and then edit the message to include the time that it took for the event to be registered."}],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            bot.comics.poll(Skarm.commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

