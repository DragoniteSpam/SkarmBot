"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["line", "lines", "linecount"],
        params: [],
        usageChar: "!",
        helpText: "Returns the number of messages in Skarm's log for the current server.",
        examples: [{
            command: "e!lines",
            effect: "Reports the amount of general message lines recorded for parroting in this server."
        }],
        ignoreHidden: true,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let guild = e.message.guild;
            Skarm.sendMessageDelay(e.message.channel, "Lines known for **" +
                guild.name + "**: " + Guilds.get(guild.id).getLineCount());
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

