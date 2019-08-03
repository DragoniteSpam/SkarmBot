"use strict";
// actual bot code goes here, because i want to try to keep bot.js to delegating work on events
const fs = require("fs");

const { ShantyCollection, Shanty } = require("./shanties.js");
const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

class Bot {
    constructor(client) {
        this.client = client;
        this.shanties = new ShantyCollection();
        this.channelsPinUpvotes = {};
    }
    
    // events
    OnMessageDelete(e) {
        var string = "";
        if (e.message != null){
            if (/*e.message.channel != client.Channels.get("344295609194250250") &&*/ !e.message.author.bot){
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
        
        if (e.message !== null && !e.message.pinned/* && this.channelsPinUpvotes[e.message.channel_id]*/ /* !== undefined && === true */) {
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
}

module.exports = Bot;