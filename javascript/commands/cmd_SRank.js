"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["srank","slevel"],
        params: ["<@targetID>, exp"],
        usageChar: "@",
        helpText: "Sets how much exp you have in the guild\r\n",
        examples: [
            {command: "e@srank 256",                 effect: "Sets your own experience points to 256.  Enough to achieve level 2!"},
            {command: "e@srank @magikarp#1234 0",    effect: "Sets the experience points of the user @magikarp#1234 to 0"},
            {command: "e@srank @Dragonite#7992 100", effect: "Sets the experience points of the user `@Dragonite#7992` to 100.  Enough to achieve level 1!"},
            {command: "e@srank @Dragonite#7992 -",   effect: "Removes dragonite's record from the exp table.  Future message by dragonite will re-add him to the table."},
        ],
        ignoreHidden: true,
        category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
            let param = Skarm.commandParamTokens(e.message.content);
            let target;
            let newExp;

            //dont mess up the data if no input params are given or too many are given
            if(param.length === 0 || param.length > 2){
                Skarm.help(this,e);
                return;
            }

            if(param.length === 1){
                newExp = param[0];
            }

            if(param.length === 2) {
                let p0 = param.shift();
                if(p0.includes("@")){    //target first
                    target = p0;
                    newExp = param[0];
                }else{                              //exp first
                    newExp = p0;
                    target = param[0];
                }

                target = Skarm.extractUser(target);
            }

            if (!guildData.hasPermissions(userData, Permissions.MOD)) {
                Skarm.log("unauthorized edit detected. Due to finite storage, this incident will not be reported.");
                return;
            }

            //if no target is specified, assume self-targetted
            target = target || e.message.author.id;
            
            let user = guildData.expTable[target];
            if(user) {
                if(newExp === "-"){
                    delete guildData.expTable[target];
                    Skarm.sendMessageDelay(e.message.channel, "User data purged.");
                }else {
                    if (!isNaN(newExp - 0))
                        user.exp = newExp;
                    user.level = Skinner.getLevel(user.exp);
                    user.nextLevelEXP = Skinner.getMinEXP(user.level);
                    Skarm.sendMessageDelay(e.message.channel, "New rank data for <@"+ (target)+">\n>>> New total EXP: " + user.exp + "\nEXP required to go for next level: " + (user.nextLevelEXP - user.exp) + "\nCurrent level: " + user.level);
                    let guildMembers = e.message.guild.members;
                    for(let member of guildMembers){
                        if(member.id === target){
                            guildData.roleCheck(member, user);
                        }
                    }
                }
            }else{
                Skarm.sendMessageDelay(e.message.channel, `Failed to find guild record for user with ID ${target}`);
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

