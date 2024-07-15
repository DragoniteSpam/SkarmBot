"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["zipf"],
        params: ["<startIndex>"],
        usageChar: "!",
        helpText: [
            "Queries a list of words sent in the server by their relative frequencies. Optional integer parameter for offsetting the 10 displayed words.",
            "This feature is inspired as a case study of [the zipf mystery](https://www.youtube.com/watch?v=fCn8zs912OE)"
        ].join("\n"),
        examples: [
            {command: "e!zipf", effect: "Lists the top 10 most frequent words said in the server."},
            {command: "e!zipf 11", effect: "Lists the 11th through 20th most frequent words said in the server."}
        ],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let args = Skarm.commandParamString(e.message.content);
            if (!args || args.length < 1) args = 1;
            Skarm.sendMessageDelay(e.message.channel, guildData.zipf.getZipfSubset(args));
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

