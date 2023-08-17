"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");
const ViewRoleReward = require("./cmd_ViewRoleReward.js");

module.exports = {
        aliases: ["setlevelreward","levelreward","reward","slr"],
        params: ["level","@role | unbind"],
        usageChar:"@",
        helpText: "Configures a role reward for reaching a certain level. Only one role can be assigned to be granted at any given level. Current maximum level is: "+Skinner.EXPREQ.length,
        examples: [
            {command: "e@slr",                    effect: "Reports the roles that are rewarded for leveling up in this guild"},
            {command: "e@setlevelreward 2 @lvl2", effect: "Configures skarm to reward the role `@lvl2` for achieving level 2."},
            {command: "e@setlevelreward 2 -",     effect: "Configures skarm to not reward any role for achieving level 2."}
        ],
        ignoreHidden: true,
        category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
            if(e.message.guild === null){
                Skarm.sendMessageDelay(e.message.channel, "Error: guild not found.");
                return;
            }
            if (!Guilds.get(e.message.channel.guild_id).hasPermissions(Users.get(e.message.author.id), Permissions.MOD)) {
                Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
                return;
            }
            let pars = Skarm.commandParamTokens(e.message.content);
            if(pars.length!==2){
                if(pars.length===0){
                    ViewRoleReward.execute(bot,e,userData,guildData);
                    return;
                }
                Skarm.help(this,e);
                return;
            }

            let level = pars[0]-0;
            if(!(level<Skinner.EXPREQ.length && level>=0 && Math.floor(level)===level)){
                Skarm.help(this,e);
                return;
            }
            if(pars[1]==="unbind" || pars[1]==="-"){
                delete Guilds.get(e.message.guild.id).rolesTable[pars[0]-0];
                ViewRoleReward.execute(bot, e, userData, guildData);
                return;
            }
            
            let targetRoleId = Skarm.extractRole(pars[1], e.message.guild);

            let allGuildRoles = Guilds.getData(guildData.id).roles;
            for(let role of allGuildRoles){
                if(role.id === targetRoleId){
                    Guilds.get(e.message.guild.id).rolesTable[level] = targetRoleId;
                    ViewRoleReward.execute(bot, e, userData, guildData); // todo: fix
                    return;
                }
            }

            Skarm.help(bot,e);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

