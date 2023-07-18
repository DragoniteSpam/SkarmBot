"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["rolemembers", "rm"],
        params: ["role"],
        usageChar: "!",
        helpText: "Returns a list of members who have all of the roles listed by the arguments of this command.",
        examples: [
            {command: "e!rm @Admins", effect: "Will cause Skarm to list all of the admins that you just pinged."},
            {command: "e!rolemembers bots", effect: "Will cause Skarm to list all of the members with the role `bots` in the server."},
            {command: "e!rolemembers bots, red", effect: "Will cause Skarm to list all of the members that have both the roles `bots` and `red` in the server."},
        ],
        ignoreHidden: true,
        category: "general",

        execute(bot, e, userData, guildData) {
            let targets = Skarm.commandParamString(e.message.content.toLowerCase().trim()).replaceAll(" ","").split(",");
            //todo: provide support for multiple roles to filter by
            let guildRoles = e.message.guild.roles;
            let matchingMembers = e.message.guild.members;
            let queryRoleNames = [ ];

            for(let target of targets){
                if(target.length === 0) return Skarm.help(this, e);          //return help text on commands with no arguments
                for(let role of guildRoles){
                    if(role.id.includes(target) || role.name.toLowerCase().includes(target.toLowerCase())){
                        target = role;
                        break;
                    }
                }
                // convert user input to role object

                // target === string --> no role match found
                if(typeof(target)==="string") {
                    Skarm.sendMessageDelay(e.message.channel, `Error: found no role matching: \`${target}\``);
                    return;
                }

                queryRoleNames.push(target.name);

                //filter matching members by that role
                for(let i = 0; i<matchingMembers.length; i++){
                    let member = matchingMembers[i];
                    let memberMatches = false;

                    //check if member has role
                    for(let role of member.roles){
                        if(role.id === target.id) {
                            memberMatches = true;
                            break;
                        }
                    }
                    //remove members that don't match the target list from the matching set
                    if(!memberMatches){
                        matchingMembers.splice(i--,1);
                    }
                }
            }

            if(matchingMembers.length === 0){
                Skarm.sendMessageDelay(e.message.channel, "Found no members with this set of roles.");
                return;
            }

            // convert member objects to member mentions after the query is complete
            for(let i in matchingMembers){
                matchingMembers[i] = matchingMembers[i].mention;
            }

            //format results
            let embedobj = {
                color: Skarm.generateRGB(),
                title: "Members with roles: " + queryRoleNames.join(", "),
                description: matchingMembers.join("\r\n").substring(0,2000),
                timestamp: new Date(),
                footer: {text: "Member Role Query"}
            };
            Skarm.sendMessageDelay(e.message.channel, " ",false, embedobj);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

