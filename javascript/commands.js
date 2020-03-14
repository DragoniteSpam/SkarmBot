"use strict";
const fs = require("fs");
const Constants = require("./Constants.js");

module.exports = {
    // general
    Google: {
        aliases: ["google"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns the results of a Google search of the specified query.",
        ignoreHidden: true,
        
        execute(bot, e) {
            Web.google(bot, e, Skarm.commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Wolfy: {
        aliases: ["wolfram", "wolfy"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns a Wolfram|Alpha API request for the given query.",
        ignoreHidden: true,
        
        execute(bot, e) {
            Web.wolfy(bot, e, Skarm.commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Stack: {
        aliases: ["stack", "so", "stackoverflow"],
        params: ["query..."],
        usageChar: "!",
        helpText: "Returns a Stackoverflow search for the given query",
        ignoreHidden: true,
        
        execute(bot, e) {
            Web.stackOverflow(bot, e, Skarm.commandParamString(e.message.content));
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },

    // special
    Ping: {
        aliases: ["ping"],
        params: [""],
        usageChar: "!",
        helpText: "Sends a test message to the channel, and then attempts to edit it. Useful for testing the bot's response time.",
        ignoreHidden: true,
        
        execute(bot, e) {
            var timeStart = Date.now();
            // don't use sendMessageDelay - you want this to be instantaneous
            e.message.channel.sendMessage("Testing response time...").then(e => {
                e.edit("Response time: `" + (Date.now() - timeStart) + " ms`");
            });
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Help: {
        aliases: ["help"],
        params: ["[term]"],
        usageChar: "!",
        helpText: "Provides an encyclopedia entry for the specified command. Or alternatively, the bot as a whole.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let params = e.message.content.split(" ");
            params.shift();
            let cmd = params[0];
            if (!cmd) {
                Skarm.sendMessageDelay(e.message.channel, "Skarm is a Discord bot made by Dragonite#7992 and Master9000#9716. Use the help command with a command name to see the documentation for it! (At some point in the future I'll compile a full list of the available commands, probably in the form of a wiki page on the Github because who wants to page through documentation in a Discord channel, but that day is not today.)");
                return;
            } else {
                if (bot.mapping.help[cmd]) {
                    bot.mapping.help[cmd].help(bot, e);
                    return;
                }
                if (bot.mapping.cmd[cmd]) {
                    bot.mapping.cmd[cmd].help(bot, e);
                    return;
                }
                Skarm.sendMessageDelay(e.message.channel, "Command not found: " + cmd + ". Use the help command followed by the name of the command you wish to look up.");
                
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Credits: {
        aliases: ["credits"],
        params: [""],
        usageChar: "!",
        helpText: "It's literally just the credits. Why do you need help with this?",
        ignoreHidden: true,
        
        execute(bot, e) {
            let version = Math.floor(Math.random() * 0xffffffff);
            Skarm.sendMessageDelay(e.message.channel,
`**Skarm Bot 2**\n
Lead spaghetti chef: Dragonite#7992
Seondary spaghetti chef: ArgoTheNaut#8957
Version: ${version}

Library: Discordie (JavaScript):
<https://qeled.github.io/discordie/#/?_k=m9kij6>

Dragonite:
<https://www.youtube.com/c/dragonitespam>
<https://github.com/DragoniteSpam/SkarmBot>

Argo:
<please send me a few links of yours that I can shill>

Extra ideas came from SuperDragonite2172, willofd2011, Cadance and probably other people.

Thanks to basically everyone on the Kingdom of Zeal server for testing this thing, as well as all of the people who Argo somehow tricked into worshipping him as their god-king.

Wolfram-Alpha is awesome:
<https://www.npmjs.com/package/node-wolfram>`
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    
    // administrative
    Pin: {
        aliases: ["pin"],
        params: ["query..."],
        usageChar: "@",
        helpText: "Toggles the pinning of messages with the required number of upvote reactions in the channel. This command is only usable by users with kicking boots.",
        ignoreHidden: true,
        
        execute(bot, e) {
            if (!permCheckBase(bot, e)) {
                return;
            }
            
            if (bot.toggleChannel(bot.channelsPinUpvotes, e.message.channel_id)) {
                Skarm.sendMessageDelay(e.message.channel, bot.nick + " will now pin upvotes in **" + e.message.channel.name + "**");
            } else {
                Skarm.sendMessageDelay(e.message.channel, bot.nick + " will no longer pin upvotes in **" + e.message.channel.name + "**");
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Munroe: {
        aliases: ["munroe"],
        params: [],
        usageChar: "@",
        helpText: "Toggles the periodic posting of new XKCD comics in the channel. This command is only usable by users with kicking boots. The Geneva Convention requires every guild is to have at least one channel dedicated to this.",
        ignoreHidden: true,
        
        execute(bot, e) {
            if (!permCheckBase(bot, e)) {
                return;
            }
            
            if (bot.toggleChannel(bot.channelsWhoLikeXKCD, e.message.channel_id)) {
                Skarm.sendMessageDelay(e.message.channel, "XKCDs will now be sent to **" + e.message.channel.name + "!**");
            } else {
                Skarm.sendMessageDelay(e.message.channel, "XKCDs will no longer be sent to **" + e.message.channel.name + ".**");
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Censor: {
        aliases: ["censor"],
        params: [],
        usageChar: "@",
        helpText: "Toggles the censor in the guild. This command is only usable by users with kicking boots. Hint: if you wish to cause mass pandemonium, be generous with your kicking boots.",
        ignoreHidden: true,
        
        execute(bot, e) {
            if (!permCheckBase(bot, e)) {
                return;
            }
            
            if (bot.toggleChannel(bot.channelsCensorHidden, e.message.channel_id)) {
                Skarm.sendMessageDelay(e.message.channel, bot.nick + " will no longer run the censor on **" + e.message.channel.name + "**");
            } else {
                Skarm.sendMessageDelay(e.message.channel, bot.nick + " will once again run the censor on **" + e.message.channel.name + "**");
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Welcome: {
        aliases: ["welcome"],
        params: [],
        usageChar: "@",
        helpText: "Toggles the welcome message in the guild. If enabled, the welcome message will be sent to the channel this command was used in. This command is only usable by users with kicking boots.",
        ignoreHidden: true,
        
        execute(bot, e) {
            if (!permCheckBase(bot, e)) {
                return;
            }
            
            if (bot.toggleGuild(bot.guildsWithWelcomeMessage, e.message.channel)) {
                Skarm.sendMessageDelay(e.message.channel, "Welcome messages will now be sent to **" + e.message.channel.guild.name + "** in this channel!");
            } else {
                Skarm.sendMessageDelay(e.message.channel, "Welcome messages will no longer be sent to **" + e.message.channel.guild.name + ".**");
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Hide: {
        aliases: ["hide"],
        params: [],
        usageChar: "@",
        helpText: "Toggles visibility of the bot in the channel this is used in. This command is only usable by users with kicking boots.",
        ignoreHidden: false,
        
        execute(bot, e) {
            if (!permCheckBase(bot, e)) {
                return;
            }
            
            if (bot.toggleChannel(bot.channelsHidden, e.message.channel_id)) {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now hidden from " + bot.nick);
            } else {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now visible to " + bot.nick);
            }
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
}