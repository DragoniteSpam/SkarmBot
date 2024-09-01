"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["1", "error"],
        params: ["...data"],
        usageChar: "@",
        helpText: "Infra message forwarding to test error logs",
        examples: [
            {command: "e@error logged error message", effect: "post to log"},
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let msg = Skarm.commandParamString(e.message.content);
            Skarm.logError(msg);
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
}

