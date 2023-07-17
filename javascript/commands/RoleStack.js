"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["rolestack"],
        params: ["enable | disable"],
        usageChar: "@",
        helpText: "Toggles whether or not to keep previous roles when rewarding a new level up role.",
        examples: [
            {command: "e@rolestack",                 effect: "Reports whether or not skarm currently stacks leveled role rewards."},
            {command: "e@rolestack enable",          effect: "Configures skarm to reward the entire stack of level rewards for the server."},
            {command: "e@rolestack disable",         effect: "Configures skarm to reward only the highest level role reward for the server."},
        ],
        ignoreHidden: true,
        category: "leveling",
        perms: Permissions.MOD,


        execute(bot, e, userData, guildData) {
            if (!guildData.hasPermissions(userData, Permissions.MOD)) {
                Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
                return;
            }
            let tokens = Skarm.commandParamTokens(e.message.content);
            if(tokens.length===0){
                Skarm.sendMessageDelay(e.message.channel,e.message.guild.name+((guildData.roleStack)?" currently rewards":" doesn't currently reward")+" stacked roles");
                return;
            }
            if(tokens[0]==="enable" || tokens[0]==="e"){
                guildData.roleStack=true;
                Skarm.sendMessageDelay(e.message.channel,e.message.guild.name+" will now reward stacked roles");
                return;
            }
            if(tokens[0]==="disable" || tokens[0]==="d"){
                guildData.roleStack=false;
                Skarm.sendMessageDelay(e.message.channel,e.message.guild.name+" will not reward stacked roles");
                return;
            }
            Skarm.help(this,e);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

