"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
    aliases: ["action", "actions", "actioncount"],
    params: [],
    usageChar: "!",
    helpText: "Returns the number of actions in Skarm's log for the current server.",
    examples: [
        {command: "e!action", effect: "Reports the amount of action lines recorded for this server."}
    ],
    ignoreHidden: true,
    category: "meta",

    execute(bot, e, userData, guildData) {
        let guild = e.message.guild;
        Skarm.sendMessageDelay(e.message.channel, "Actions known for **" +
            guild.name + "**: " + guildData.getActionCount());
    },
    
    help(bot, e) {
        Skarm.help(this, e);
    },
}
