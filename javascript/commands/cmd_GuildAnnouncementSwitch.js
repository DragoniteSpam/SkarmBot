"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["levelannounce", "announce"],
        params: ["enable | disable"],
        usageChar: "@",
        helpText: "Toggles the state of announcing when a user levels up in the guild",
        examples: [
            {command: "e@announce",         effect: "Reports whether or not skarm announces level-ups in this guild."},
            {command: "e@announce enable",  effect: "Configures skarm to announce level-ups in this guild."},
            {command: "e@announce disable", effect: "Configures skarm to not announce level-ups in this guild."},
        ],
        ignoreHidden: true,
        category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
            if (!guildData.hasPermissions(userData, Permissions.MOD)) {
                Skarm.spam("Unauthorized edit detected. Due to finite storage, this incident will not be reported.");
                return;
            }

            let tokens = Skarm.commandParamTokens(e.message.content.toLowerCase());
            for (let token of tokens) {
                if (token[0] === "e") {
                    guildData.announcesLevels = true;
                }

                if (token[0] === "d") {
                    guildData.announcesLevels = false;
                }
            }

            if (guildData.announcesLevels) {
                Skarm.sendMessageDelay(e.message.channel, "Level ups will be announced in this guild");
                return;
            }
            Skarm.sendMessageDelay(e.message.channel, "Level ups will not be announced in this guild");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

