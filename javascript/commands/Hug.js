"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["hug"],
        params: ["<victim>"],
        usageChar: "!",
        helpText: "Hugs a target, or defaults to the summoner.",
        examples: [
            {command: "e!hug", effect: "Will cause Skarm to hug whoever invoked the command."},
            {command: "e!hug Dragonite#7992", effect: "Will cause Skarm to hug the user named Dragonite#7992."}
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let target = Skarm.commandParamTokens(e.message.content)[0];
            if(target == null) target = e.message.author.username;
            Skarm.sendMessageDelay(e.message.channel, "_hugs " + target + "_");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

