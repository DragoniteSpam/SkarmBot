"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");

class XKCD {
    constructor() {
        this.channels = [];
        this.latestDate = new Date();
        this.timeout = null;
    }
    
    save() {
        var required = {
            channels: this.channels
        };
        
        fs.writeFile(".\\data\\xk.cd", JSON.stringify(required), function(err) {
            if (err) {
                Skarm.log("failed to write out the xkcd data for some reason");
            }
        });
    }
    
    load() {
        if (fs.existsSync(".\\data\\xk.cd")){
            var loaded = JSON.parse(fs.readFileSync(".\\data\\xk.cd")
                .toString());
            
            if (loaded.channels !== undefined){
                this.channels = loaded.channels;
            }
        }
        
        this.schedule();
    }
    
    post(channel, id) {
        if (id === undefined) {
            Skarm.todo();
            return;
        }
        
        Skarm.sendMessageDelay(channel, "https://xkcd.com/" + id + "/");
    }
    
    toggleChannel(channel){
        if (this.channels.includes(channel.id)){
            Skarm.todo();
            sendMessageDelay("xkcds will no longer be sent to this channel!", channel);
            this.channels.splice(this.channels.indexOf(channel.id), 1);
        } else {
            sendMessageDelay("xkcds will now be sent to this channel!", channel);
            this.channels.push(channel.id);
        }
        
        this.save();
    }
}

module.exports = XKCD;