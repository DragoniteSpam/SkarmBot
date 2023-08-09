"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["rolerewards","rr"],
        params: [],
        usageChar: "!",
        helpText: "Displays roles rewarded for leveling up.",
        examples: [
            {command: "e!rolerewards", effect: "Reports the roles that are rewarded for leveling up in this guild."},
        ],
        ignoreHidden:true,
        category: "leveling",

        execute(bot, e, userData, guildData) {
            let roles = guildData.rolesTable;
            if(Object.keys(roles).length===0){
                Skarm.sendMessageDelay(e.message.channel,"No roles configured to be rewarded from leveling up in "+e.message.guild.name);
                return;
            }

            let fields = [];
            for(let i in roles){
                fields.push({name: "Level " + i, value: "<@&"+roles[i]+">", inline: true});
            }

            e.message.channel.sendMessage(" ", false, {
                color: Skarm.generateRGB(),
                timestamp: new Date(),
                title: "Roles rewarded from leveling up in "+e.message.guild.name,
                fields: fields,
                footer: {
                    text: e.message.guild.name,
                },
            });

        },
        help(bot, e) {
            Skarm.help(this, e);
        },
}

