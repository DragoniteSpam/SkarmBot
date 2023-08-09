"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["configurebuffrole", "configbuff", "buffconfig", "buffconf", "cbr"],
        params: ["[action (get,set,remove)]", "[role(ping or id)]", "[stat(base,bonus,cooldown,luck)]", "[modifier(num 0 - 1000)]"],
        usageChar: "@",
        helpText: "This command configures a role to give buffs for leveling up in the server.",
        examples: [
            {command: "e@cbr set @admin basebuff 2", effect: "Users with the `@admin` role will receive 2 more base exp per message from this role."},
            {command: "e@cbr set @admin bonus 10",   effect: "Users with the `@admin` role will receive up to 10 more bonus exp per message from this role."},
            {command: "e@configurebuffrole get",     effect: "Reports the list of roles with buffs of any kind."},
            {command: "e@cbr get @admin",            effect: "Reports the current buffs affecting the `@admin` role."},
            {command: "e@cbr remove @admin",         effect: "Removes all buffs currently assigned to the `@admin` role."},
            {command: "Base",     effect: "Modifies the minimum exp gained when a qualifying message is sent. Default server value: 15"},
            {command: "Bonus",    effect: "Modifies the random bonus exp gained above the maximum when a qualifying message is sent.  Default server value: 10."},
            {command: "Cooldown", effect: "Reduces the wait time between qualifying messages.  Scaling is linearized. Default server value: 100. Default server cooldown: 60s.  Granting 100 cooldown reduction will cause the effective cooldown to be 60s/(100 (base) + 100 (bonus)) = 30s"},
            {command: "Luck",     effect: "Modifies the probability that a message will get close to the full bonus exp. Default server value: 100. For more info: https://github.com/DragoniteSpam/SkarmBot/blob/master/data/doc/Skarm%20leveling%20luck%20probability.pdf"},
        ],
        ignoreHidden: true,
        category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData){
            let statAliases = {         //map alias to its definition
                baseBuff: "baseBuff",
                base:     "baseBuff",
                bonus:     "bonusBuff",
                bonusBuff: "bonusBuff",
                cooldownBuff: "cooldownBuff",
                cooldown:     "cooldownBuff",
                cd:           "cooldownBuff",
                luckBuff: "luckBuff",
                luck:     "luckBuff",
                lb:       "luckBuff"
            };
            let actionWords = ["get", "set", "remove"];
            let content = e.message.content.toLowerCase();
            let tokens = Skarm.commandParamTokens(content);
            let channel = e.message.channel;

            //at least one parameter required for the role to work properly
            if(tokens.length < 1) return this.help(bot, e);

            let action, role, stat, modifier;

            //determine action
            for(let actionWord of actionWords){
                for(let t in tokens){
                    if(tokens[t].includes(actionWord)){
                        action = actionWord;
                        tokens.splice(t,1); //remove the token from the array
                        break;
                    }
                }
            }

            if(tokens.length === 0){
                if(action === "get"){
                    // return list of roles that exist in the guild buff list
                    let buffedRoles = Object.keys(guildData.expBuffRoles);
                    let roles = [ ];
                    for(let i in buffedRoles){
                        roles.push("<@&"+buffedRoles[i]+">");
                    }
                    if(roles.length) {
                        e.message.channel.sendMessage(" ", false, {
                            color: Skarm.generateRGB(),
                            timestamp: new Date(),
                            //title: ,
                            fields: [
                                {name: "Roles with buffs", value: roles.join("\r\n")}
                            ],
                            footer: {
                                text: e.message.guild.name,
                            },
                        });
                    }else{
                        Skarm.sendMessageDelay(channel, "No roles in the server have been configured with buffs");
                    }
                    return;
                }else {
                    return this.help(bot, e);           //not enough arguments
                }
            }

            //acquire role
            let roles = e.message.guild.roles;
            for(let t = 0; t < tokens.length; t++){
                for(let guildRole of roles){
                    if(tokens[t].includes(guildRole.id)){   //must be ping or ID of role for this to work
                        role = guildRole.id;
                        tokens.splice(t,1);     //remove token from array
                        t = tokens.length;                //break out of both loops
                        break;
                    }
                }
            }


            //acquire stat and modifier if they must be set
            if(action === "set"){
                // acquire stat
                for(let t = 0; t < tokens.length; t++){
                    if(tokens[t] in statAliases){
                        stat = statAliases[tokens[t]];
                        tokens.splice(t,1);
                        break;
                    }
                }

                // acquire modifier
                for(let t = 0; t < tokens.length; t++){
                    if(tokens[t] > -1){
                        modifier = tokens[t];
                        tokens.splice(t,1);
                        break;
                    }
                }
            }

            if(role === undefined) {
                Skarm.sendMessageDelay(channel, "Error: failed to find the role to apply action to.");
                return;
            }
            guildData.modifyExpBuffRoles(channel, action, role, stat, modifier);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

