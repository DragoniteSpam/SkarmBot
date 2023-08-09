"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["google", "cosia"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns the results of a web search of the specified query. The `cosia` alias is an acceptable usage of punning.",
        examples: [
            {command: "e!google sonder definition", effect: "Provides a link to a search engine query for `sonder definition`"}
        ],
        ignoreHidden: true,
        category: "web",

        execute(bot, e, userData, guildData) {
            Web.google(bot, e, Skarm.commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

