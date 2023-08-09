"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
    aliases: ["drago", "dragonite"],
    params: [],
    usageChar: "!",
    helpText: "reminds the bot author to get some sunshine once in a while",
    examples: [
        {command: "e!drago", effect: "Instructs the lead spaghetti chef to acquire vitamin D."}
    ],
    ignoreHidden: true,
    category: "general",
    
    execute(bot, e, userData, guildData) {
        Skarm.sendMessageDelay(e.message.channel, "go play outside dragonite");
    },
    
    help(bot, e) {
        Skarm.help(this, e);
    },
}
