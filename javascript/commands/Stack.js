"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["stack", "so", "stackoverflow"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns a Stackoverflow search for the given query",
        examples: [
            {command: "e!stackoverflow how to center a div inside of a div", effect: "Provides a link to the stack overflow search results for `how to center a div inside of a div`"}
        ],
        ignoreHidden: true,
        category: "web",

        execute(bot, e, userData, guildData) {
            Web.stackOverflow(bot, e, Skarm.commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

