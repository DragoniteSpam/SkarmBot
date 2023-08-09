"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["sudo", "su"],
        params: ["mention"],
        usageChar: "!",
        helpText: "Shows the user's access level (pleb, moderator, admin, Mom, etc).",
        examples: [
            {command: "e!sudo", effect: "Reports what your current access level is."},
            {command: "e!sudo @GuildMember", effect: "Reports the current access level held by `@GuildMember`."}
        ],
        ignoreHidden: false,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let words = Skarm.commandParamTokens(e.message.content);
            let member;
            if(words.length===1){
                let id=words[0].replace("<","").replace("@","").replace("!","").replace(">","");
                member=Guilds.client.Users.get(id).memberOf(e.message.guild);
                userData=Users.get(id);
                if(member==null){
                    Skarm.sendMessageDelay("Failed to find mentioned member. Please try again using the format `e!su <@userID>`");
                    return;
                }
            }else{
                member = e.message.author.memberOf(e.message.guild);
            }
            let permissions = guildData.getPermissions(userData);
            let permNames = [ ];
            
            if (permissions === Permissions.NOT_IN_GUILD) permNames.push("NOT_IN_GUILD");
            if (permissions & Permissions.RESTIRCTED) permNames.push("RESTIRCTED");
            if (permissions & Permissions.BASE) permNames.push("BASE");
            if (permissions & Permissions.MOD) permNames.push("MOD");
            if (permissions & Permissions.ADMIN) permNames.push("ADMIN");
            if (permissions === Permissions.SUDO) permNames.push("DEVELOPER");
            
            
            Skarm.sendMessageDelay(e.message.channel, "Current permissions of **" +
                member.name + "** in **" + e.message.guild.name + ":**\n" +
                permNames.join(", ")
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
}

