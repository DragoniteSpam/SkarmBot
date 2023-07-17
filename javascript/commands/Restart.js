"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["restart","reboot"],
        params: [],
        usageChar: "@",
        helpText: "Terminates the process running the bot safely, but with the exit code to restart operation. Use this to ensure that data is saved before restarting for updates. Note that this will only work if the bot is started from `launcher.bat`, which it always should be.",
        examples: [
            {command: "e@reboot", effect: "Save and reboot."}
        ],ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            Skarm.log("Restarting by order of <@" + e.message.author.id + ">");
            //save memory before a restart
            bot.save(Constants.SaveCodes.REBOOT);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

