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
        
        this.shanties = new ShantyCollection();
        this.channelsPinUpvotes = {};
        this.channelsHidden = {};
        this.channelsCensorHidden = {};
        
        this.web = new Web(client);
        
        this.mapping = {
            "e!censor": this.cmdCensor,
            "e!pin": this.cmdPin,
            "e!wolfy": this.cmdWolfy,
            "e!google": this.cmdGoogle,
            "e!so": this.cmdStack
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
    
    OnMessageCreate(e) {
        // don't respond to other bots (or yourself)
        if (e.message.author.bot) {
            return false;
        }
        // i don't know how you would delete a message the instant it's created but
        if (e.message.deleted) {
            return false;
        }
        // don't respond to private messages (yet)
        if (e.message.isPrivate){
            e.message.channel.sendMessage("private message responses not yet implemented");
            return false;
        }
        // first we need to check for the "e!hide" command here, because if we do it later there'll be no way to undo it
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
            this.mapping[first](this, e);
        }
    }
    
    // functionality
    censor(e) {
    }
    
    toggleChannel(map, channel) {
        map[channel] = !map[channel];
        return map[channel];
    }
    
    // commands
    cmdHide(bot, e) {
        if (bot.toggleChannel(bot.channelsHidden, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now hidden from " + bot.nick);
        } else {
            Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now visible to " + bot.nick);
        }
    }
    
    cmdCensor(bot, e) {
        if (bot.toggleChannel(bot.channelsCensorHidden, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, bot.nick + " will no longer run the censor on **" + e.message.channel.name + "**");
        } else {
            Skarm.sendMessageDelay(e.message.channel, bot.nick + " will once again run the censor on **" + e.message.channel.name + "**");
        }
    }
    
    cmdPin(bot, e) {
        if (bot.toggleChannel(bot.channelsPinUpvotes, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, bot.nick + " will now pin upvotes in **" + e.message.channel.name + "**");
        } else {
            Skarm.sendMessageDelay(e.message.channel, bot.nick + " will no longer pin upvotes in **" + e.message.channel.name + "**");
        }
    }
    
    cmdWolfy(bot, e) {
        Web.wolfy(bot, e);
    }
    
    cmdGoogle(bot, e) {
        Web.google(bot, e);
    }
    
    cmdStack(bot, e) {
        Web.stackOverflow(bot, e);
    }
}

module.exports = Bot;