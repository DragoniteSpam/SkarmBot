"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["rolerefresh","role","refresh"],
        params: [],
        usageChar: "!",
        helpText: "Refreshes level up role assignments (Role rewards need to be configured for this to do anything useful)",
        examples: [
            {command: "e!refresh", effect: "Forces a refresh of your leveled roles."}
        ],
        ignoreHidden: false,
        category: "leveling",

        execute(bot, e, userData, guildData) {
            guildData.roleCheck(e.message.member, guildData.expTable[e.message.author.id]);
            Skarm.sendMessageDelay(e.message.channel,"Refreshed your roles!");
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

