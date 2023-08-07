"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["soap"],
        params: ["[scope]"],
        usageChar: "@",
        helpText: "Wash skarm's mouth out with soap if he picked up potty language from chat (or some other forms of purging the logs).",
        examples: [
            {command: "e@soap", effect: "Will remove the last thing that skarm parroted to chat from his quote archives."},
            {command: "e@soap --text", effect: "Deletes the text logs for the guild."},
            {command: "e@soap --action", effect: "Deletes the action logs for the guild."},
            {command: "e@soap --global", effect: "Deletes both the text and action logs for the guild."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content.toLowerCase());
            let action = tokens.shift();
            
            if (action === "--text") {
                guildData.soapText();
                Skarm.sendMessageDelay(e.message.channel,"Text log has been purged!");
                return;
            }
            if (action === "--action") {
                guildData.soapActions();
                Skarm.sendMessageDelay(e.message.channel,"Action log has been purged!");
                return;
            }
            if (action === "--global") {
                guildData.soapText();
                guildData.soapActions();
                Skarm.sendMessageDelay(e.message.channel,"Text and action logs have been purged!");
                return;
            }
            
            // fallback soap behavior
            guildData.soap();
            Skarm.sendMessageDelay(e.message.channel,"sorry...");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

