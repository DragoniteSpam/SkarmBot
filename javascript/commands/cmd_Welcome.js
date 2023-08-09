"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["welcome"],
        params: ["enable", "disable", "set <message>"],
        usageChar: "@",
        helpText: "Configure welcome messages for the guild",
        examples: [
            {command: "e@welcome enable", effect: "Will enable welcome messages being sent when users join."},
            {command: "e@welcome disable", effect: "Will disable welcome messages from being sent when users join."},
            {command: "e@welcome set -", effect: "Will remove the welcome message configured for the channel in which the command is run."},
            {command: "e@welcome set Welcome <newmember>! Please don't be evil!", effect: "Will set the welcome message in the channel to `Welcome @theNewKid! Please don't be evil!`"}
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            if(guildData.welcoming===undefined)
                guildData.welcoming=true;
            if(guildData.welcomes===undefined){
                guildData.welcomes = { };
            }

            let tokens = Skarm.commandParamTokens(e.message.content.toLowerCase());
            if(tokens[0]==="enable" || tokens[0]==="e"){
                guildData.welcoming=true;
                Skarm.sendMessageDelay(e.message.channel,"Welcome messages have been enabled. Use e@welcome set to configure welcome messages");
                return;
            }
            if(tokens[0]==="disable" || tokens[0]==="d"){
                guildData.welcoming=false;
                Skarm.sendMessageDelay(e.message.channel,"Welcome messages have been disabled. All messages configured with e@welcome will not be sent");
                return;
            }
            if(tokens[0]==="set" || tokens[0]==="s"){
                let welcome = e.message.content.trim().split(" ");
                welcome.shift();
                welcome.shift();
                welcome = welcome.join(" ");
                if(tokens.length===1){
                    Skarm.sendMessageDelay(e.message.channel, "Current welcome message is:\n"+guildData.welcomes[e.message.channel.id]);
                    return;
                }
                if(welcome.trim() ==="-"){
                    delete guildData.welcomes[e.message.channel];
                    Skarm.sendMessageDelay(e.message.channel, "Welcome message removed");
                    return;
                }
                guildData.welcomes[e.message.channel.id]=welcome;
                Skarm.sendMessageDelay(e.message.channel,"Welcome message set to: "+guildData.welcomes[e.message.channel.id]);
                return;
            }

            if(!guildData.welcoming){
                Skarm.sendMessageDelay(e.message.channel, e.message.guild.name + " does not currently send welcome messages. Welcome messages can be turned on with e@welcome enable");
                return;
            }
            let retStr="";
            for(let channel in guildData.welcomes){
                retStr+="<#"+channel+">"+ guildData.welcomes[channel]+"\n";
            }
            if(retStr===""){
                Skarm.sendMessageDelay(e.message.channel,"There are currently no welcome messages in "+e.message.guild.name+". Sending any newly configured messages is currently "+ ((guildData.welcoming)?"enabled":"disabled"));
                return;
            }
            Skarm.sendMessageDelay(e.message.channel,"Current welcome messages in "+e.message.guild.name+":\n"+retStr);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

