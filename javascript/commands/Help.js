"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["help", "man", "?"],
        params: ["[term]"],
        usageChar: "!",
        helpText: "Skarm is a Discord bot made by <@137336478291329024> and <@162952008712716288>.\r\n" +   /*unfortunately, "Constants.Moms.Drago.mention" could not be used due to not being initialized yet*/
            "Use the help command with a command name to see the documentation for it!\r\n" +
            "Type either `e!help [command-name]` to get help on a specific command, or `e!help` to see a list of all available commands.\r\n",
        examples: [
            {command: "e!help",         effect: "Shows all available commands to run"},
            {command: "e!help help",    effect: "Shows the documentation for usage of `e!help` (hey, this is it!)"},
            {command: "e!?",            effect: "Shows the documentation for usage of `e!help` (hey, this is it!)"},
            {command: "e!man activity", effect: "Shows the documentation for usage of `e!activity`"},
            {command: "e?comics",         effect: "Shows the documentation for usage of `e@comics`"},
        ],
        ignoreHidden: false,
        category: "meta",

        execute(bot, e, userData, guildData) {
            let cmd = Skarm.commandParamTokens(e.message.content)[0];
            if (e.message.content === "e!?")
                cmd = "?";

            if (cmd === "?") {
                Skarm.help(this, e);
                return;
            }

            if (!cmd) {
                let guildData = Guilds.get(e.message.channel.guild_id);
                let userData = Users.get(e.message.author.id);
                let categories = {};

                for (let key in bot.mapping.unaliased) {
                    if (bot.mapping.unaliased[key].usageChar === "!" || guildData.hasPermissions(userData, bot.mapping.unaliased[key].perms)) {
                        let cat = bot.mapping.unaliased[key].category;
                        if (cat in categories) {
                            categories[cat].push(key);
                        } else {
                            categories[cat] = [key];
                        }
                    }
                }

                let alphabet = [];
                for (let sets in categories) {
                    categories[sets].sort();
                    alphabet.push({name: sets, value: categories[sets].join(", ")});
                }
                let embedobj = {
                    color: Skarm.generateRGB(),
                    title: "Commands",
                    timestamp: new Date(),
                    fields: alphabet,
                    footer: {text: e.message.member.nick || e.message.author.username + " | "}
                };

                Skarm.sendMessageDelay(e.message.channel, " ", false, embedobj);//"Available commands: ```" + alphabet.join("\n\n") + "```\nSome commands have additional aliases.");
                return;
            }

            if (bot.mapping.help[cmd]) {
                bot.mapping.help[cmd].help(bot, e);
                return;
            }

            if (bot.mapping.help["e?"+cmd]) {
                bot.mapping.help["e?"+cmd].help(bot, e);
                return;
            }

            if (bot.mapping.cmd[cmd]) {
                bot.mapping.cmd[cmd].help(bot, e);
                return;
            }

            Skarm.sendMessageDelay(e.message.channel, "Command not found: " + cmd + ". Use the help command followed by the name of the command you wish to look up.");
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

