"use strict";
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

const Users = require("./user.js");
const Guilds = require("./guild.js");

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
    XKCD: {
        aliases: ["xkcd"],
        params: ["id"],
        usageChar: "!",
        helpText: "Returns the XKCD with the specified ID",
        ignoreHidden: true,
        
        execute(bot, e) {
            bot.xkcd.post(e.message.channel, Skarm.commandParamString(e.message.content).split(" ")[0]);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Summon: {
        aliases: ["summon", "summons"],
        params: ["add|remove|list", "term"],
        usageChar: "!",
        helpText: "Skarm can be asked to send you notifications for messages with certain keywords (often your username, or other topics you like to know about - for example, \"Wooloo\" or \"programming\"). You can add, remove, or list your summons.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let params = Skarm.commandParamString(e.message.content.toLowerCase()).split(" ");
            let userData = Users.get(e.message.author.id);
            let action = params[0];
            let term = params[1];
            if (action === "add") {
                if (userData.addSummon(term)) {
                    Skarm.sendMessageDelay(e.message.channel, "**" + term + "** is now a summon for " + e.message.author.username + "!");
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "Could not add the term " + term + " as a summon. (Has it already been added?)");
                }
                return;
            }
            if (action === "remove") {
                if (userData.removeSummon(term)) {
                    Skarm.sendMessageDelay(e.message.channel, "**" + term + "** is no longer a summon for " + e.message.author.username + "!");
                } else {
                    Skarm.sendMessageDelay(e.message.channel, "Could not remove the term " + term + " as a summon. (Does it exist in the summon list?)");
                }
                return;
            }
            if (action === "list") {
                Skarm.sendMessageDelay(e.message.channel, "**" + e.message.author.username + "**, your current summons are:\n```" + userData.listSummons() + "```");
                return;
            }
            Skarm.sendMessageDelay(e.message.channel, "Not the correct usage for this command! Consult the help documentation for information on how to use it.");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    // we're still trying to persuade ourselves that these are funny
    Drago: {
        aliases: ["drago", "dragonite"],
        params: [],
        usageChar: "!",
        helpText: "reminds the bot author to get some sunshine once in a while",
        ignoreHidden: true,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "go play outside dragonite");
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Gummy: {
        aliases: ["gummy"],
        params: [],
        usageChar: "!",
        helpText: "skarm has an important announcement for the one called Gummy",
        ignoreHidden: true,
        
        execute(bot, e) {
            Skarm.sendMessageDelay(e.message.channel, "gummy you are a baka");
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
	Hug: {
        aliases: ["hug"],
        params: [""],
        usageChar: "!",
        helpText: "Hugs a target, or defaults to the summoner.",
        ignoreHidden: true,
        
        execute(bot, e) {
			let target = Skarm.commandParamString(e.message.content.toLowerCase()).split(" ")[0];
			if(target==null)
				target=e.message.author.username;
            Skarm.sendMessageDelay(e.message.channel,"*hugs "+target+"*");
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
<https://github.com/Master9000>

Extra ideas came from SuperDragonite2172, willofd2011, Cadance and probably other people.

Thanks to basically everyone on the Kingdom of Zeal server for testing this bot thing, as well as all of the people who Argo somehow tricked into worshipping him as their god-king.

Wolfram-Alpha is awesome:
<https://www.npmjs.com/package/node-wolfram>

Random quotes are from Douglas Adams, Terry Pratchett, Arthur C. Clark, Rick Cook, and The Elder Scrolls V: Skyrim.`
            );
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
    Stats: {
        aliases: ["bot"],
        params: [""],
        usageChar: "!",
        helpText: "Displays some stats about the bot.",
        ignoreHidden: true,
        
        execute(bot, e) {
            let uptime = process.uptime();
            let uptimeDays = Math.floor(uptime / 86400);
            let uptimeHours = Math.floor((uptime / 3600) % 24);
            let uptimeMinutes = Math.floor((uptime / 60) % 60);
            let uptimeSeconds = Math.floor(uptime % 60);
            let uptimeString = "";
            
            if (uptimeDays > 0) {
                uptimeString = uptimeDays + ((uptimeDays > 1) ? " days, " : " day, ");
            }
            if (uptimeHours > 0) {
                uptimeString += uptimeHours + ((uptimeHouse > 1) ? " hours, " : " hour, ");
            }
            if (uptimeMinutes > 0) {
                uptimeString += uptimeMinutes + ((uptimeMinutes > 1) ? " minutes, " : " minute, ");
            }
            uptimeString += uptimeSeconds + ((uptimeSeconds > 1) ? " seconds" : " second");
            
            Skarm.sendMessageDelay(e.message.channel,
                "***Bot stats, and stuff:***\n```" +
                "Users (probably): " + Object.keys(Users.users).length + "\n" +
                "Memory usage (probably): " + process.memoryUsage().rss / 0x100000 + " MB\n" +
                "Uptime (probably): " + uptimeString + "```"
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
	Exit: {
        aliases: ["exit","shutdown"],
        params: [],
        usageChar: "@",
        helpText: "Terminates the process running the bot safely. Use this to ensure that data is saved before restarting for maintainance or any other reasons. ",
        ignoreHidden: false,
        
        execute(bot, e) {
            if (!Skarm.isGod(e.message.author.id)) {
                return Skarm.log("False god <@"+e.message.author.id+"> tried to shut me down");
            }
            
            //TODO saveData
			Skarm.log("Shutting down by order of <@"+e.message.author.id+">");
			
			//gives the bot two seconds to save all files 
			setTimeout(() => {process.exit(0);},2000);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
	Restart: {
        aliases: ["restart"],
        params: [],
        usageChar: "@",
        helpText: "Terminates the process running the bot safely, but with the exit code to restart operation. Use this to ensure that data is saved before restarting for updates. Note that this will only work if the bot is started from `launcher.bat`, which it always should be.",
        ignoreHidden: false,
        
        execute(bot, e) {
            if (!Skarm.isGod(e.message.author.id)) {
                return Skarm.log("False god <@"+e.message.author.id+"> tried to restart me");
            }
            
            //TODO saveData
			Skarm.log("Restarting by order of <@"+e.message.author.id+">");
			
			//gives the bot two seconds to save all files 
			setTimeout(() => {process.exit(69);},2000);
        },
        
        help(bot, e) {
            Skarm.help(this, e);
        },
    },
}