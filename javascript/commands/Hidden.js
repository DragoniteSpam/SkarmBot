"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["hidden"],
        params: [],
        usageChar: "@",
        helpText: "Lists *ALL* channels that skarm is ignoring in the server.",
        examples: [
            {command: "e@hidden", effect: "Skarm prints a list of the channels that he's ignoring"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let msgStr = "Hidden channels:\n";
            guildData.getHiddenChannels().map((channel) => {
                msgStr += `<#${channel}>\n`;
            });
            Skarm.sendMessageDelay(e.message.channel, msgStr);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

