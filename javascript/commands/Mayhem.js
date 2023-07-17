"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["mayhem", "chaos"],
        params: ["[roleID]"],
        usageChar: "@",
        helpText: "Toggles a role to function as a mayhem color. Please use the role ID as to avoid tagging people unnecessarily. If no parameter is specified, a list of the mayhem roles will be printed instead.",
        examples: [
            {command: "e@mayhem", effect: "Will cause Skarm to list all mayhem roles."},
            {command: "e@chaos 412002840815599617", effect: "Will cause skarm to add the role with the ID `412002840815599617` to the mayhem list."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let args = Skarm.commandParamTokens(e.message.content);
            
            if (args.length === 0) {
                var roles = Object.keys(guildData.mayhemRoles);
                for (let i = 0; i < roles.length; i++) {
                    let found = false;
                    for (let role of e.message.guild.roles) {
                        if (role.id === roles[i] && guildData.mayhemRoles[roles[i]]) {
                            roles[i] = role.name;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        guildData.toggleMayhem(roles[i]);
                        roles[i] = undefined;
                    }
                }
                // if any invalid roles are in the mayhem list (deleted roles, etc) remove them
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i] === undefined) {
                        roles.splice(i--, 1);
                    }
                }
                roles.sort();
                if (roles.length === 0) {
                    Skarm.sendMessageDelay(e.message.channel, "No mayhem roles have been set up yet!");
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "**Current mayhem roles:**\n" + roles.join(", "));
                }
                return;
            }
            
            let roleData = undefined;
            for (let role of e.message.guild.roles) {
                if (role.id === args[0]) {
                    roleData = role;
                    break;
                }
            }
            
            if (!roleData) {
                Skarm.sendMessageDelay(e.message.channel, "Invalid role ID specified (be sure to use the role's ID instead of the @ tag, because people find being pinged to be very annoying)");
                return;
            }
            
            if (guildData.toggleMayhem(args[0])) {
                Skarm.sendMessageDelay(e.message.channel, "**" + roleData.name + "** has been added as a mayhem color");
            } else {
                Skarm.sendMessageDelay(e.message.channel, "**" + roleData.name + "** has been removed as a mayhem color");
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

