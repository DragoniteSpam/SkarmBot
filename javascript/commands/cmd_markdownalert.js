"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["markdownalert"],
        params: ["enable|disable"],
        usageChar: "@",
        helpText: "Toggles enabling/disabling skarm automatically responding in the channel about messages when they contain deceptive markdown links. For example, [google.com](https://xkcd.com/908/). This command is only usable by users with kicking boots. This toggle applies to the entire server. This feature is enabled by default.",
        examples: [
            {command: "e@markdownalert", effect: "Will report whether or not alerts are enabled."},
            {command: "e@markdownalert enable", effect: "Will enable alerts."},
            {command: "e@markdownalert disable", effect: "Will disable alerts."}
        ],
        ignoreHidden: true,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content);
            let channel = e.message.channel;

            if(tokens.length && tokens[0].toLowerCase() === "enable"){
                guildData.deceptiveMarkdownLinkAlert = true;
            }

            if(tokens.length && tokens[0].toLowerCase() === "disable"){
                guildData.deceptiveMarkdownLinkAlert = false;
            }

            Skarm.sendMessageDelay(channel, `Message alerts for suspicious markdown links are ${guildData.deceptiveMarkdownLinkAlert ? "enabled" : "disabled"}.`);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

