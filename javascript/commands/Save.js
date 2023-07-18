"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["save","quicksave","s","f5"],
        params: [],
        usageChar: "@",
        helpText: "Save skarm's data in memory to storage. Saving data will automatically run during a restart or shutdown command",
        examples: [
            {command: "e@save", effect: "Saves data."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            bot.save(Constants.SaveCodes.DONOTHING);
            Skarm.sendMessageDelay(e.message.channel, "Data has been saved.");
        },
        
        help(bot, e){
            Skarm.help(this, e);
        },
}

