"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["sar", "getrole"],
        params: ["group"],
        usageChar: "!",
        helpText: "Equip self-assigned roles.",
        examples: [
            {command: "e!sar", effect: "Will list the available role groups to pick from."},
            {command: "e!sar games", effect: "Will list the available roles in the `games` group."},
        ],
        ignoreHidden: false,
        perms: Permissions.BASE,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            /**
             * Global variables
             */

            let tokens = Skarm.commandParamTokens(e.message.content.toLowerCase());
            let action = tokens.shift();
            let sarTreeRoot = guildData.selfAssignedRoles;
            let nonEmptyGroups = { };
            let outputString = "Unknown argument";

            /**
             * Functions
             */

            // populate non-empty role groups for user selection
            // this function modifies outputStrings and populates nonEmptyGroups `global` variables
            let populateAvailableGroups = function() {
                let i=0;
                for (let group in sarTreeRoot) {
                    if(sarTreeRoot[group].hasRoles()) {      // check if any roles are in the group
                        outputString += `\`${++i}\`: ${group}\n`;
                        nonEmptyGroups[i] = group;
                    }
                }
                    outputString += "`c`: Cancel\n";
            }

            let selectRoleFromGroup = function(e) {
                let outputString = "";
                // Check cancellation condition
                if(e.message.content.toLowerCase() === "c") {
                    Skarm.sendMessage(e.message.channel, "Cancelled");
                    return;
                }

                // filter invalid input
                if(!(e.message.content in userData.transcientActionStateData[e.message.channel.id].validRoles)){
                    Skarm.sendMessageDelete(e.message.channel, "Error: target role not found. Please try again or `c` to cancel.", undefined, undefined, 60000, e.message.author.id, bot);
                    userData.setActionState(selectRoleFromGroup, e.message.channel.id, 60);
                    return;
                }

                let targetRole = userData.transcientActionStateData[e.message.channel.id].validRoles[e.message.content].role;

                let role;
                for(let guildRole of e.message.guild.roles) {
                    if(guildRole.id === targetRole) {
                        role = guildRole;
                        break;
                    }
                }

                if(!role){
                    Skarm.sendMessageDelete(e.message.channel, "Error: target role not found. Please try again or `c` to cancel.", 60000, e.message.author.id, bot);
                    return;
                }

                let roleDeltas = sarTreeRoot[userData.transcientActionStateData[e.message.channel.id].group].requestRoleToggle(targetRole, e.message.member);

                for(let delta of roleDeltas) {
                    outputString += `${delta.change} role: <@&${delta.role}>\n`;
                }

                Skarm.sendMessage(e.message.channel, " ", false, {
                        color: Skarm.generateRGB(),
                        author: {name: e.message.author.nick},
                        description: outputString,
                        timestamp: new Date(),
                        footer: {text: "SAR"}
                    });

                // delete priors
                userData.deleteTransientMessagePrev(e.message.channel.id);
                e.message.delete();

                // purge remnants, resolving state
                userData.transcientActionStateData[e.message.channel.id] = { };
            }

            let selectGroup = function(channel, messageContent) {
                // handle cancellations first
                if(messageContent.toLowerCase() === "c") {
                    Skarm.sendMessage(channel, "Cancelled");
                    return;
                }

                // filter invalid input
                if (!(messageContent in nonEmptyGroups)) {
                    Skarm.sendMessageDelete(channel, "Error: target group not found. Please try again or `c` to cancel.", undefined, undefined, 60000, e.message.author.id, bot);
                    userData.setActionState(selectGroupHandler, channel.id, 60);
                    return;
                }

                // display roles in selected group
                let group = nonEmptyGroups[messageContent];
                if(!userData.transcientActionStateData[channel.id])
                    userData.transcientActionStateData[channel.id] = { };

                let vr = sarTreeRoot[group].getAvailableRoles(e.message.member);
                userData.transcientActionStateData[channel.id].validRoles = vr;    // sends message containing available roles, returns those roles as a hashmap of valid entities
                userData.transcientActionStateData[channel.id].group = group;

                // set state to role selection
                userData.setActionState(selectRoleFromGroup, channel.id, 60);

                let outputString = "Available Roles:\n";

                // i - indexed role-action pair, vr - valid roles
                for(let i in vr){
                    outputString += `\`${i}\`: ${vr[i].action} role: <@&${vr[i].role}>\n`;
                }

                outputString += "`c`: Cancel\n";

                Skarm.sendMessage(channel," ",false, {
                        color: Skarm.generateRGB(),
                        description: outputString,
                        timestamp: new Date(),
                        footer: {text: "SAR"}
                    },
                    // Add next-state instruction to delete prior message
                    (message, err) => {
                        userData.transcientActionStateData[channel.id].deleteMessage = message.id;
                    }
                );
            }

            let selectGroupHandler = function(e) {
                selectGroup(e.message.channel, e.message.content);

                // delete priors
                userData.deleteTransientMessagePrev(e.message.channel.id);
                e.message.delete();
            }

            /**
             * Initialization
             */

            outputString = "Available groups: \n";
            populateAvailableGroups();

            /**
             * Case handling
             */


            // Default Case: no arguments
            if(action === undefined){
                let nonEmptyGroupCount = Object.keys(nonEmptyGroups).length;
                switch (nonEmptyGroupCount){
                    case 0:
                        outputString = "No populated self-assigned role groups exist.\nCreate a group with `e@csar add YourGroupName`!\nAdd a role to a group with `e@csar YourGroupName add @Bees`";
                        break;

                    case 1:
                        // autoselect the only group
                        selectGroup(e.message.channel, Object.keys(nonEmptyGroups)[0]);
                        return;

                    default:
                        outputString += "\nSelect a group!";
                        userData.setActionState(selectGroupHandler, e.message.channel.id, 60);
                }
            }

            // Case: action == group Name -> skip a menu
            for(let idx in nonEmptyGroups){
                if(action === nonEmptyGroups[idx]){
                    selectGroup(e.message.channel, idx);
                    return;         // avoids smd end of function
                }
            }
            
            Skarm.sendMessage(e.message.channel, " ", false, {
                    color: Skarm.generateRGB(),
                    author: {name: e.message.author.nick},
                    description: outputString,
                    timestamp: new Date(),
                    footer: {text: "SAR"}
                },
                // Add next-state instruction to delete prior message
                (message, err) => {
                    userData.transcientActionStateData[e.message.channel.id] = {deleteMessage: message.id};
                }
            );
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

