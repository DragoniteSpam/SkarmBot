"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["suggest", "suggestion", "issue", "complain", "bug", "bugreport"],
        params: [""],
        usageChar: "!",
        helpText: "Provides a list to the Github Issues page, where you may complain to your heart's content.",
        examples: [{command: "e!suggest", effect: "Provides the link to the submission page."}],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            Skarm.sendMessageDelay(e.message.channel, "You may submit your questions and complaints here: https://github.com/DragoniteSpam/SkarmBot/issues");
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

