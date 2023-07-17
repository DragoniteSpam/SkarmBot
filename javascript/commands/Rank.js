"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["level","rank"],
        params: ["[<@guild member>]"],
        usageChar: "!",
        helpText: "Reports how much exp a member has with the guild, what level that equates to, how much exp is needed to get to the next level, and the member's position on the guild leaderboard.",
        examples: [
            {command: "e!rank", effect: "Will report how much experience you have."},
            {command: "e!rank @Dragonite", effect: "Will report how much experience `@Dragonite` has."},
        ],
        ignoreHidden: true,
        category: "leveling",

        execute(bot, e, userData, guildData) {
            let target = e.message.author.id;
            let tok = Skarm.commandParamTokens(e.message.content);
            let outputBase = " ";
            if(tok.length===1){
                let user = guildData.resolveUser(tok[0]);
                if(Array.isArray(user)){
                    outputBase =`Multiple users (${user.length}) identified as potential matches.  Please refine query.`;
                    user = user[0];
                }
                if(!user || !(user.id in guildData.expTable)){
                    Skarm.sendMessageDelay(e.message.channel,"Error: this user may have not talked at all or you didn't mention them properly.");
                    return;
                }
                target = user.id;
            }

            let user = guildData.expTable[target];
            let exp = user.exp - 0;
            let lvl = user.level;
            let toNextLvl = user.nextLevelEXP - exp;
            let targetEntity = bot.client.Users.get(target);
            let guildMembers = e.message.guild.members;
            let targetNick;
            for(let member of guildMembers){
                if(member.id === target) targetNick = member.nick;
            }

            //https://discordjs.guide/popular-topics/embeds.html#embed-preview
            e.message.channel.sendMessage(outputBase, false, {
                color: Skarm.generateRGB(),
                author: {name: Users.get(target).nickName || targetNick || targetEntity.username || target},
                timestamp: new Date(),
                fields: [
                    {name: "Total EXP",         value: exp,                           inline: true},
                    {name: "Level",             value: lvl,                           inline: true},
                    {name: "Rank",              value: guildData.getUserRank(target), inline: true},
                    {name: "EXP to next level", value: toNextLvl,                     inline: true}
                ],
                footer: {
                    text: Users.get(target).nickName,
                    icon_url: ((targetEntity) ? targetEntity.staticAvatarURL :"https://i.imgur.com/ICK2lr1.jpeg")
                },
            });
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

