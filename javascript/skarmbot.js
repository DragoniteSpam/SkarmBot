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
            this.mapping[first](e);
            return true;
        }
        
        if (this.mentions(e, this.validNickReferences)) {
            e.message.channel.sendMessage("mentioned nickname keyword");
            return true;
        }
        
        if (this.mentions(e, this.validESReferences)) {
            e.message.channel.sendMessage("mentioned skyrim keyword");
            return true;
        }
        
        if (this.mentions(e, this.validShantyReferences)) {
            e.message.channel.sendMessage("mentioned shanty keyword");
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
    
    // commands
    cmdHide(e) {
        if (this.toggleChannel(this.channelsHidden, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now hidden from " + this.nick);
        } else {
            Skarm.sendMessageDelay(e.message.channel, "**" + e.message.channel.name + "** is now visible to " + this.nick);
        }
    }
    
    cmdCensor(e) {
        if (this.toggleChannel(this.channelsCensorHidden, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, this.nick + " will no longer run the censor on **" + e.message.channel.name + "**");
        } else {
            Skarm.sendMessageDelay(e.message.channel, this.nick + " will once again run the censor on **" + e.message.channel.name + "**");
        }
    }
    
    cmdPin(e) {
        if (this.toggleChannel(this.channelsPinUpvotes, e.message.channel_id)) {
            Skarm.sendMessageDelay(e.message.channel, this.nick + " will now pin upvotes in **" + e.message.channel.name + "**");
        } else {
            Skarm.sendMessageDelay(e.message.channel, this.nick + " will no longer pin upvotes in **" + e.message.channel.name + "**");
        }
    }
    
    cmdWolfy(e) {
        Web.wolfy(this, e);
    }
    
    cmdGoogle(e) {
        Web.google(this, e);
    }
    
    cmdStack(e) {
        Web.stackOverflow(this, e);
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
}

module.exports = Bot;