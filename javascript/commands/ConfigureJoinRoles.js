"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["joinroles", "joinrole", "jr"],
        params: ["add | remove | clear", "@role"],
        usageChar: "@",
        helpText: "Configure a collection of roles to be granted to members upon joining the server",
        examples: [
            {command: "e@joinroles", effect: "Will list the currently configured roles granted for joining."},
            {command: "e@joinroles add @StarterRole", effect: "Will set the role @StarterRole to be awarded to all new members joining the server."},
            {command: "e@joinroles remove @StarterRole", effect: "Will remove the role @StarterRole from the list of roles being awarded to all new members joining the server."},
            {command: "e@joinroles clear", effect: "Will clear the list of roles awarded to all new members joining the server."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content.toLowerCase());
            let guildRoles = e.message.guild.roles;
            let action = tokens.shift();

            if(action==="add" || action==="a"){
                for(let roleToAdd of tokens) {
                    let roleAddable = false;
                    for (let role of guildRoles) {
                        if (roleToAdd.includes(role.id)) {
                            roleAddable = role.id;
                        }
                    }
                    if (roleAddable) guildData.serverJoinRoles[roleAddable] = Date.now();
                }
            }

            if(action==="remove" || action==="rm" || action==="r"){
                for(let roleToRem of tokens) {
                    let removeID = false;
                    for (let role of guildRoles) {
                        if (roleToRem.includes(role.id)) {
                            removeID = role.id;
                        }
                    }
                    delete guildData.serverJoinRoles[removeID];
                }
            }
            if(action==="clear"){
                guildData.serverJoinRoles = { };
            }

            let description = "Roles assigned to new members:\r\n";
            for (let roleID in guildData.serverJoinRoles){
                description += `<@&${roleID}>\r\n`;
            }
            if (Object.keys(guildData.serverJoinRoles).length === 0){
                description = "No roles configured!";
            }

            Skarm.sendMessageDelay(e.message.channel, " ", false, {
                color: Skarm.generateRGB(),
                author: {name: e.message.author.nick},
                description: description,
                timestamp: new Date(),
                footer: {text: e.message.guild.name}
            });
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

