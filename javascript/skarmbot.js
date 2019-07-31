"use strict";
// actual bot code goes here, because i want to try to keep bot.js to delegating work on events
const fs = require("fs");

const Skarm = require("./skarm.js");
const Constants = require("./constants.js");

class Bot {
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
        Skarm.todo("implement this - auto-pin channels should be kept as a list somewhere instead of hard-coded");
        if (e.emoji.name == "Upvote"){
            if (e.message != null && e.message.channel_id == BLACKBIRD){
                // This is horrible and i should feel horrible about writing it //gohere
                Skarm.todo("find a better way to do this, also");
                if (lastTenReactions.length>=10){
                    lastTenReactions.shift();
                }
                lastTenReactions.push(e.message);
                var count=0;
                for (var i=0; i<lastTenReactions.length; i++){
                    if (lastTenReactions[i]==e.message){
                        count++;
                    }
                }
                
                if (count==3&&!e.message.pinned){
                    e.message.pin();
                    fetchPinnedSelf(e.message.channel);
                }
            }
        }
    }
}

module.exports = Bot;