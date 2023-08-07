"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["configsar","csar", "cesar"],
        params: ["[varied]"],
        usageChar: "@",
        helpText: "Configure a collection of roles to be granted to members when they run e!sar\n" +
                    "Complete parameter list: e@csar {add, delete (del), rename (ren), GroupName}",
        examples: [
            {command: "e@csar", effect: "Will list the currently configured role groups."},
            {command: "e@csar add Games", effect: "Will create a group `Games` which contains self-assigned roles."},
            {command: "e@csar delete Games", effect: "Will delete the group `Games` and all of its contents."},
            {command: "e@csar rename Ganes Games", effect: "Will rename the group `Ganes` to `Games`, preserving its contents."},
            {command: "e@csar Games", effect: "Will list all roles available from the SAR group `Games`."},
            {command: "e@csar Games add Terraria", effect: "Will add the role @Terraria to the SAR group `Games`."},
            {command: "e@csar Games add Terraria, Warframe, Factorio", effect: "Will add the roles @Terraria, @Warframe, and @Factorio to the SAR group `Games`."},
            {command: "e@csar Games remove Terraria", effect: "Will remove the role @Terraria from the SAR group `Games`."},
            {command: "e@csar Games remove Terraria, Warframe, Factorio", effect: "Will remove the roles @Terraria, @Warframe, and @Factorio to the SAR group `Games`."},
            {command: "e@csar Games clear", effect: "Will remove all roles from the SAR group `Games`."},
            {command: "e@csar Games max", effect: "Will report the amount of roles from the group `Games` that can be equipped."},
            {command: "e@csar Games max 0", effect: "Will remove the limit for the amount of roles from the group `Games` that can be equipped."},
            {command: "e@csar Games max 2", effect: "Will set the limit for the amount of roles from the group `Games` that can be equipped to 2 roles."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content.toLowerCase());
            let guildRoles = e.message.guild.roles;
            let action = tokens.shift();
            let sarTreeRoot = guildData.selfAssignedRoles;
            let outputString = "";

            let reservedTerms = ["add", "delete", "del", "rename", "ren"];
            let reservedHash = {};
            for (let rt of reservedTerms) reservedHash[rt]=true;

            if(action === undefined){
                outputString = "Available groups: ";
                for(let group in sarTreeRoot){
                    outputString += "`"+group+"`, ";
                }
                outputString=outputString.substring(0,outputString.length-2);
                if (Object.keys(sarTreeRoot).length === 0){
                    outputString = "No self-assigned role groups exist.\nCreate one with `e@csar add YourGroupName`!";
                }
            }

            if(action==="add"){
                for(let groupToAdd of tokens) {
                    if (groupToAdd in reservedHash) continue;
                    if (!(groupToAdd in sarTreeRoot)){
                        sarTreeRoot[groupToAdd] = new SarGroups(guildData.id, groupToAdd);
                        outputString += `Added group: `+groupToAdd+`\n`;
                    }
                }
            }

            if(action==="delete" || action==="del"){
                for(let groupToAdd of tokens) {
                    if (groupToAdd in reservedHash) continue;
                    if (groupToAdd in sarTreeRoot){
                        delete sarTreeRoot[groupToAdd];
                        outputString += `Deleted group: `+groupToAdd+`\n`;
                    } else {
                        outputString += "Group not found: " + groupToAdd + "\n";
                    }
                }
            }

            if(action === "rename" || action === "ren") {
                if(tokens.length !== 2){
                    outputString = `Error: Expected 2 arguments, found ${tokens.length} (\`${tokens.join("`, `")}\`)`;
                }else {
                    let oldName = tokens[0];
                    let newName = tokens[1];
                    if (newName in sarTreeRoot || newName in reservedHash){
                        outputString = "Error: new name already occupied";
                    }else{
                        sarTreeRoot[newName] = sarTreeRoot[oldName];
                        delete sarTreeRoot[oldName];
                        sarTreeRoot[newName].rename(newName);
                        outputString += "renamed group " + oldName + " to " + newName;
                    }
                }
            }

            if(action in sarTreeRoot) {
                let groupStr = action;
                let groupObj = sarTreeRoot[groupStr];
                action = tokens.shift();

                // role actions available

                //list
                if(action === undefined){
                    outputString = "Roles in group " + groupStr + ":\n";
                    for(let roleID of groupObj.getRoles()){
                            outputString += `<@&${roleID}>, `;
                    }
                    outputString = outputString.substring(0,outputString.length-2);

                    if (Object.keys(groupObj).length === 0){
                        outputString = "No self-assigned roles in this group!\nAdd them with `e@csar " + groupStr + " add RoleName`!";
                    }
                }

                // add roles to the group
                if(action==="add"){
                    for(let roleToAdd of tokens) {
                        let roleAddable = false;
                        for (let role of guildRoles) {
                            if (roleToAdd.includes(role.id) || role.name.toLowerCase().includes(roleToAdd)) {
                                roleAddable = role.id;
                            }
                        }
                        if (roleAddable) {
                            if(groupObj.addRoleToGroup(roleAddable)) {
                                outputString += `Added role <@&${roleAddable}> to group ` + groupStr + "\n";
                            }else {
                                outputString += `Role <@&${roleAddable}> was already in group ` + groupStr + "\n";
                            }
                        } else {
                            outputString += "Target `" + roleToAdd + "` not found.\n";
                        }
                    }
                }

                // remove roles from the group
                if(action==="remove") {
                    for (let roleToRem of tokens) {
                        let removeID = false;
                        for (let role of guildRoles) {
                            if (roleToRem.includes(role.id) || role.name.toLowerCase().includes(roleToRem)) {
                                removeID = role.id;
                            }
                        }
                        if (groupObj.removeRoleFromGroup(removeID)) {
                            outputString += `Removed role <@&${removeID}> from group ` + groupStr + "\n";
                        }else{
                            outputString += `Role <@&${removeID}> was not in group ` + groupStr + "\n";
                        }
                    }
                }

                // clear all data from group
                if(action==="clear") {
                    sarTreeRoot[groupStr] = new SarGroups(e.message.guild.id, groupStr);
                    outputString += "Hard reset applied to group: " + groupStr +"\n";
                }

                // max
                if(action === "max") {
                    if(tokens.length) {
                        let newMRC = groupObj.setMax(tokens[0]);
                        if(newMRC)
                            outputString = "Maximum roles for group set to: " + newMRC;
                        else
                            outputString = "Role maximum for group removed";
                    } else {
                        // default: get
                        if (groupObj.max) {
                            outputString = `Maximum number of roles that can be equipped from ${groupStr}: ${groupObj.max}`;
                        } else {
                            outputString = "Unlimited roles can be equipped from group: " + groupStr;
                        }
                    }
                }
            }

            Skarm.sendMessageDelay(e.message.channel, " ", false, {
                color: Skarm.generateRGB(),
                author: {name: e.message.author.nick},
                description: outputString,
                timestamp: new Date(),
                footer: {text: "SAR Configuration"}
            });
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

