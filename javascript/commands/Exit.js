"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["exit","shutdown"],
        params: ["-nosave", "vPID"],
        usageChar: "@",
        helpText: "Terminates the process running the bot safely. Use this to ensure that data is saved before restarting for maintainance or any other reasons. Use the extension -nosave to prevent commiting to skarmData.",
        examples: [
            {command: "e@exit", effect: "Save and shut down."},
            {command: "e@exit -nosave", effect: "Shut down without saving."},
            {command: "e@exit 37120",   effect: "Save and shut down the instance of Skarmbot with process ID 37120."},
            {command: "e@exit 37120 -nosave",   effect: "Shut down the instance of Skarmbot with process ID 37120 without saving."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOM,
        category: "infrastructure",

        execute(bot, e, userData, guildData) {
            let savecode = Constants.SaveCodes.EXIT;
            //save data before a shutdown
            let tokens = Skarm.commandParamTokens(e.message.content.toLowerCase());
            for(let token of tokens){
                if(token === "-nosave" || token === "-ns"){
                    //Skarm.log("Shutting down without saving by order of <@" + e.message.author.id + ">");
                    savecode=(Constants.SaveCodes.NOSAVE);
                }

                //if a process ID number is specified, abort shutdown unless this is your process ID
                if(token < (Constants.processIdMax << Constants.versionOffsetBits) && tokens[i] != bot.pid){
                    return;
                }
            }
            bot.save(savecode);
            Skarm.log("Shutting down by order of <@" + e.message.author.id + ">");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

