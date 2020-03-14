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
        
        this.mapping = {
            "e!censor": this.cmdCensor,
            "e!pin": this.cmdPin,
            "e!wolfy": this.cmdWolfy,
            "e!google": this.cmdGoogle,
            "e!so": this.cmdStack,
            "e!xkcd": this.cmdMunroe,
            "e!munroe": this.cmdMunroe,
            "e!welcome": this.cmdWelcome,
        };
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
        // first we need to check for the "e!hide" command here, because if we
        // do it later there'll be no way to undo it
        if (e.message.content.startsWith("e!hide")) {
            this.cmdHide(e);
        }
        // ignore hidden channels
        if (this.channelsHidden[e.message.channel_id]) {
            return false;
        }
        // ignore messages that mention anyone or anything
        if (e.message.mentions.length > 0 || e.message.mention_roles.length > 0 || e.message.mention_everyone){
            return false;
        }
        // now we can start doing stuff
        if(!this.channelsCensorHidden[e.message.channel_id]){
            this.censor(e);
        }
        
        let author = e.message.author;
        let text = e.message.content.toLowerCase();
        let first = e.message.content.split(" ")[0];
        
        // this is where all of the command stuff happens
        if (this.mapping[first]) {
            // i'm not a fan of needing to pass "this" as a parameter to you
            // own functions, but javascript doesn't seem to want to execute
            // functions called in this way in the object's own scope and you
            // don't otherwise have a way to reference it
            this.mapping[first](this, e);
            return true;
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
    
    permCheckBase(bot, e) {
        return true;
    }
}

// commands
let cmdGoogle = {
    execute(bot, e) {
        Web.google(bot, e);
    }
    
    help(e) {
        Skarm.sendMessageDelay(e.message.channel, "Skarm.google\n" +
            "```" +
            "Returns a Google search for the given query." +
            "```"
        );
    }
};
let cmdWolfy = {
    execute(bot, e) {
        Web.wolfy(bot, e);
    }
    
    help(e) {
        Skarm.sendMessageDelay(e.message.channel, "Skarm.wolfram / Skarm.wolfy\n" +
            "```" +
            "Returns a Wolfram|Alpha API request for the given query." +
            "```"
        );
    }
};
let cmdStack = {
    execute(bot, e) {
        Web.stackOverflow(bot, e);
    }
    
    help(e) {
        Skarm.sendMessageDelay(e.message.channel, "Skarm.stackoverflow / Skarm.so / Skarm.stack\n" +
            "```" +
            "Returns a Stackoverflow search for the given query." +
            "```"
        );
    }
};
let cmdPin = {
    execute(bot, e) {
        if (!permCheckBase(bot, e)) {
            return;
        }
        
        if (bot.toggleChannel(bot.channelsPinUpvotes, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, bot.nick + " will now pin upvotes in **" + e.message.channel.name + "**");
        } else {
            Skarm.sendMessageDelay(e.message.channel, bot.nick + " will no longer pin upvotes in **" + e.message.channel.name + "**");
        }
    }
    
    help(e) {
        Skarm.sendMessageDelay(e.message.channel, "Skarm.pin\n" +
            "```" +
            "Toggles the pinning of messages with the required number of upvote reactions in the channel. This command is only usable by users with kicking boots." +
            "```"
        );
    }
};
let cmdMunroe = {
    execute(bot, e) {
        if (!permCheckBase(bot, e)) {
            return;
        }
        
        if (bot.toggleChannel(bot.channelsWhoLikeXKCD, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, "XKCDs will now be sent to **" + e.message.channel.name + "!**");
        } else {
            Skarm.sendMessageDelay(e.message.channel, "XKCDs will no longer be sent to **" + e.message.channel.name + ".**");
        }
    }
    
    help(e) {
        Skarm.sendMessageDelay(e.message.channel, "Skarm.munroe\n" +
            "```" +
            "Toggles the periodic posting of new XKCD comics in the channel. This command is only usable by users with kicking boots. The Geneva Convention requires every guild is to have at least one channel dedicated to this." +
            "```"
        );
    }
};
let cmdCensor = {
    execute(bot, e) {
        if (!permCheckBase(bot, e)) {
            return;
        }
        
        if (bot.toggleChannel(bot.channelsCensorHidden, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, bot.nick + " will no longer run the censor on **" + e.message.channel.name + "**");
        } else {
            Skarm.sendMessageDelay(e.message.channel, bot.nick + " will once again run the censor on **" + e.message.channel.name + "**");
        }
    }
    
    help(e) {
        Skarm.sendMessageDelay(e.message.channel, "Skarm.censor\n" +
            "```" +
            "Toggles the censor in the guild. This command is only usable by users with kicking boots. Hint: if you wish to cause mass pandemonium, be generous with your kicking boots." +
            "```"
        );
    }
};
let cmdWelcome = {
    execute(bot, e) {
        if (!permCheckBase(bot, e)) {
            return;
        }
        
        if (bot.toggleGuild(bot.guildsWithWelcomeMessage, e.message.channel)) {
            Skarm.sendMessageDelay(e.message.channel, "Welcome messages will now be sent to **" + e.message.channel.guild.name + "** in this channel!");
        } else {
            Skarm.sendMessageDelay(e.message.channel, "Welcome messages will no longer be sent to **" + e.message.channel.guild.name + ".**");
        }
    }
    
    help(e) {
        Skarm.sendMessageDelay(e.message.channel, "Skarm.welcome\n" +
            "```" +
            "Toggles the welcome message in the guild. If enabled, the welcome message will be sent to the channel this command was used in. This command is only usable by users with kicking boots." +
            "```"
        );
    }
};
let cmdHide = {
    execute(bot, e) {
        if (!permCheckBase(bot, e)) {
            return;
        }
        
        if (bot.toggleChannel(bot.channelsHidden, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now hidden from " + bot.nick);
        } else {
            Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now visible to " + bot.nick);
        }
    }
    
    help(e) {
        Skarm.sendMessageDelay(e.message.channel, "Skarm.hide\n" +
            "```" +
            "Toggles visibility of the bot in the channel this is used in. This command is only usable by users with kicking boots." +
            "```"
        );
    }
};

module.exports = Bot;