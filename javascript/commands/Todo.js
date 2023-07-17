"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["todo"],
        params: ["create the todo command"],
        usageChar: "@",
        helpText: "Logs to the todo list for the dev team",
        examples: [
            {command: "e@todo task", effect: "Records task to the todo channel"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            Skarm.todo(Skarm.commandParamString(e.message.content));
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

