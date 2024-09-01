"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["0", "output", "stdout"],
        params: ["...data"],
        usageChar: "@",
        helpText: "Infra message forwarding to test standard output logs",
        examples: [
            {command: "e@output logged error message", effect: "post to log"},
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let msg = Skarm.commandParamString(e.message.content);
            Skarm.log(msg);
        },

        help(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "(◕ ε ◕)");
        },
}

