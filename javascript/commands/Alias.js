"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["alias", "trigger"],
        params: ["add | remove | list | clear"],
        usageChar: "@",
        helpText: "Manage additional names that skarm will respond to.  The scope of these aliases is within the guild in which they are configured.  All aliases are case insensitive.\r\nAdd registers new aliases, Remove or delete get rid of existing aliases.  List provides a complete list of guild-specific aliases.  Clear deletes **ALL** guild-specific aliases.",
        examples: [
            {command: "e@alias add scramble",    effect: "Adds `scramble` as an alias that skarm will respond to."},
            {command: "e@alias list",            effect: "Lists all of the guild-specific aliases that skarm will respond to."},
            {command: "e@alias remove scramble", effect: "Removes `scramble` as an alias that skarm will respond to."},
            {command: "e@alias delete *",        effect: "Removes **ALL** guild-specific aliases that skarm will respond to."},
            {command: "e@alias clear",           effect: "Removes **ALL** guild-specific aliases that skarm will respond to."}
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let words = Skarm.commandParamTokens(e.message.content.toLowerCase());
            if(!guildData.aliases) guildData.aliases={ };
            if(words.length===0) {Skarm.help(this, e);return;}
            let action = words.shift();
            let alias = words.join(" ");
            let guildAliases = Object.keys(guildData.aliases).map(str => "`"+str+"`");
            //expunges all existing guild-specific aliases
            function clear(){
                Skarm.sendMessageDelay(e.message.channel, `Purging all existing aliases.  Removed aliases: ${Object.keys(guildData.aliases).join(", ")}`);
                guildData.aliases = { };
            }

            switch(action){
                case "list":
                case "ls":
                case "l":
                    if(guildAliases.length)
                        Skarm.sendMessageDelay(e.message.channel,`Skarm currently responds to the following aliases in this guild: ${guildAliases.join(", ")}`);
                    else
                        Skarm.sendMessageDelay(e.message.channel,`Skarm currently has no special aliases in this guild.`);
                    break;

                case "add":
                case "a":
                    if(words.length === 0){
                        Skarm.sendMessageDelay(e.message.channel, "Error: expected alias to add");
                    }else{
                        guildData.aliases[words.join(" ")]=1;
                        Skarm.sendMessageDelay(e.message.channel,`Added alias ${alias}`);
                        if(words.join(" ").length < 3)
                            Skarm.sendMessageDelay(e.message.channel,`Warning: the added alias is short and may potentially cause a massive quantity of responses.  Please verify that the change you just made is indeed desired.`);
                    }
                    break;

                case "remove":
                case "rem":
                case "r":
                case "delete":
                case "del":
                case "d":
                    if(words.length === 0){
                        Skarm.sendMessageDelay(e.message.channel, "Error: expected alias to remove");
                    }else {
                        if(alias === "*"){
                            return clear();
                        }
                        if (alias in guildData.aliases) {
                            delete guildData.aliases[alias];
                            Skarm.sendMessageDelay(e.message.channel, `Removed alias ${alias}`);
                        }else{
                            Skarm.sendMessageDelay(e.message.channel, `Alias ${alias} did not exist for this guild.`);
                        }
                    }
                    break;

                case "clear":
                    clear()
                    break;
                default:
                    Skarm.help(this, e);
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

