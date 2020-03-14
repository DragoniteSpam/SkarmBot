"use strict";
// actual bot code goes here, because i want to try to keep bot.js to delegating work on events
const fs = require("fs");

const { ShantyCollection, Shanty } = require("./shanties.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Web = require("./web.js");

class Bot {
    constructor(client) {
        this.client = client;
        this.nick = "Skarm";
        
        // referneces: you will speak if these are mentioned
        this.validNickReferences = {
            "skarm": 1,
            "skram!": 1,
            "birdbrain": 1,
            "spaghetti": 0.05,
        };
        
        this.validESReferences = {
            "balgruuf": 0.25,
            "ulfric": 0.25,
        };
        
        this.validShantyReferences = {
            "sing": 0.15,
            "ship": 0.25,
        };
        
        this.minimumMessageReplyLength = 3;
        
        this.shanties = new ShantyCollection();
        this.channelsPinUpvotes = {};
        this.channelsWhoLikeXKCD = {};
        this.channelsHidden = {};
        this.channelsCensorHidden = {};
        this.guildsWithWelcomeMessage = {};
        
        this.web = new Web(client);
        
        this.mapping = Skarm.addCommands([
            // general stuff
            cmdGoogle, cmdWolfy, cmdStack,
            // special
            cmdHelp, cmdCredits,
            // administrative stuff
            cmdPin, cmdMunroe, cmdCensor, cmdWelcome, cmdHide,
        ]);
    }
    
    // events
    OnMessageDelete(e) {
        var string = "";
        if (e.message != null){
            if (!e.message.author.bot){
                if (e.message == null){
                    string = "<message not cached>"; 
                } else {
                    string = e.message.content + " by " + e.message.author.username;
                }
                fs.appendFile("./deleted.txt", string + "\r\n", (err) => {
                    if (err){
                        Skarm.logError(err);
                    }
                });
                Constants.CHAN_DELETED.sendMessage(string + " <#" +  e.message.channel_id + ">");
            }
        }
    }
    
    OnMessageReactionAdd(e) {
        const UPVOTE = 0x2b06;
        const REQUIRED_UPVOTES = 1;
        
        if (e.message !== null && !e.message.pinned && this.channelsPinUpvotes[e.message.channel_id] /*!== undefined && === true */) {
            let upvotes = 0;
            for (let i in e.message.reactions) {
                let reaction = e.message.reactions[i];
                if (reaction.emoji.name.charCodeAt(0) === UPVOTE && ++upvotes == REQUIRED_UPVOTES) {
                    e.message.pin().catch(_ => { });
                    break;
                }
            }
        }
    }
    
    OnMemberAdd(e) {
        let welcomeChannel = this.client.Channels.get(this.guildsWithWelcomeMessage[e.guild.id]);
        if (welcomeChannel) {
            Skarm.sendMessageDelay(welcomeChannel, e.member.mention + ", Welcome to **" + e.guild.name + "!** Please don't be evil!");
        } else {
        }
    }
    
    OnMessageCreate(e) {
        // don't respond to other bots (or yourself)
        if (e.message.author.bot) {
            return false;
        }
        // i don't know how you would delete a message the instant it's created,
        // but . . .
        if (e.message.deleted) {
            return false;
        }
        // don't respond to private messages (yet)
        if (e.message.isPrivate){
            e.message.channel.sendMessage("private message responses not yet implemented");
            return false;
        }
        
        // ignore messages that mention anyone or anything
        if (e.message.mentions.length > 0 || e.message.mention_roles.length > 0 || e.message.mention_everyone){
            return false;
        }
        
        // now we can start doing stuff
        let author = e.message.author;
        let text = e.message.content.toLowerCase();
        let first = e.message.content.split(" ")[0];
        
        // this is where all of the command stuff happens
        if (this.mapping.cmd[first]) {
            if (!this.channelsHidden[e.message.channel_id] || !this.mapping.cmd[first].ignoreHidden) {
                // i'm not a fan of needing to pass "this" as a parameter to you
                // own functions, but javascript doesn't seem to want to execute
                // functions called in this way in the object's own scope and you
                // don't otherwise have a way to reference it
                this.mapping.cmd[first].execute(this, e);
                return true;
            }
        }
        
        // ignore hidden channels after this
        if (this.channelsHidden[e.message.channel_id]) {
            return false;
        }
        
        if(!this.channelsCensorHidden[e.message.channel_id]){
            this.censor(e);
        }
        
        if (this.mentions(e, this.validNickReferences)) {
            return true;
        }
        
        if (this.mentions(e, this.validESReferences)) {
            return true;
        }
        
        if (this.mentions(e, this.validShantyReferences)) {
            return true;
        }
        
        return false;
    }
    
    // functionality
    censor(e) {
    }
    
    toggleChannel(map, channel) {
        map[channel] = !map[channel];
        return map[channel];
    }
    
    toggleGuild(map, channel) {
        // guilds have a channel associated with them
        if (!!map[channel.guild_id]) {
            map[channel.guild_id] = undefined;
            return false;
        }
        
        map[channel.guild_id] = channel.id;
        return true;
    }
    
    // helpers
    mentions(e, references) {
        var text = e.message.content.toLowerCase();
        
        if (text.split(" ").length < this.minimumMessageReplyLength) {
            return false;
        }
        
        for (let keyword in references) {
            if (text.includes(keyword)) {
                return (Math.random() < references[keyword]);
            }
        }
        
        return false;
    }
    
    // permissions
    permCheckBase(bot, e) {
        return true;
    }
}

// commands - general
let cmdGoogle = {
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
};
let cmdWolfy = {
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
};
let cmdStack = {
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
};

// commands - special
let cmdHelp = {
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
            if (!bot.mapping.help[cmd]) {
                Skarm.sendMessageDelay(e.message.channel, "Command not found: " + cmd + ". Use the help command followed by the name of the command you wish to look up.");
                return;
            }
            bot.mapping.help[cmd].help(bot, e);
        }
    },
    
    help(bot, e) {
        Skarm.help(this, e);
    },
};
let cmdCredits = {
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
Library: Discordie (JavaScript): <https://qeled.github.io/discordie/#/?_k=m9kij6>

Dragonite:
<https://www.youtube.com/c/dragonitespam>
<https://github.com/DragoniteSpam/SkarmBot>

Argo:
<please send me a few links of yours that I can shill>

Extra ideas came from SuperDragonite2172, willofd2011, Cadance and probably other people.

Thanks to basically everyone on the Kingdom of Zeal server for testing this thing, as well as all of the people who Argo somehow tricked into worshipping him as their god-king.

Wolfram-Alpha is awesome: <https://www.npmjs.com/package/node-wolfram>`
        );
    },
    
    help(bot, e) {
        Skarm.help(this, e);
    },
};
// commands - administrative
let cmdPin = {
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
};
let cmdMunroe = {
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
};
let cmdCensor = {
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
};
let cmdWelcome = {
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
};
let cmdHide = {
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
};

module.exports = Bot;