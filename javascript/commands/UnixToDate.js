"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["unixtodate", "utd", "time"],
        params: ["#"],
        usageChar: "!",
        helpText: "Converts a unix timestamp to a date",
        examples: [
            {
                command: "e!time",
                effect: "Prints the current unix timestamp."
            },
            {
                command: "e!utd 1640000000000",
                effect: "Prints the human-readable time described by the unix timestamp given in the command."
            }
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e) {
            let tokens = Skarm.commandParamTokens(e.message.content);

            //no input -> you get the current time
            if (tokens.join("").length === 0) {
                Skarm.sendMessageDelay(e.message.channel, Date.now());
                return;
            }
            Skarm.sendMessageDelay(e.message.channel, new Date(tokens[0] - 0));
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

