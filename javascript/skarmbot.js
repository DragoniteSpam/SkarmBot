"use strict";
// actual bot code goes here, because i want to try to keep bot.js to delegating work on events
const fs = require("fs");

const { ShantyCollection, Shanty } = require("./shanties.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");
const Commands = require("./commands.js");
const Keywords = require("./keywords.js");
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
            Commands.Google, Commands.Wolfy, Commands.Stack,
            // special
            Commands.Help, Commands.Credits, Commands.Ping,
            // administrative stuff
            Commands.Pin, Commands.Munroe, Commands.Censor, Commands.Welcome,
            Commands.Hide,
        ]);
        
        this.keywords = Skarm.addKeywords([
            Keywords.Hug, Keywords.Sandwich
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
        let first = text.split(" ")[0];
        
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
        
        // each of these will kick out of the function if it finds something,
        // so the most important ones should be at the top
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
        
        for (let word in this.keywords) {
            if (!text.includes(word)) {
                continue;
            }
            
            let keyword = this.keywords[word];
            if (keyword.standalone && (!text.startsWith(word + " ") && !text.endsWith(" " + word) && !text.includes(" " + word + " "))) {
                continue;
            }
            
            if (Math.random() > keyword.odds) {
                continue;
            }
            
            keyword.execute(this, e);
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

module.exports = Bot;