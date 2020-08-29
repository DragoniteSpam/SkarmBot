"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");
const Encrypt = require("./encryption.js");

const xkcddb = "..\\skarmData\\xkcd.penguin";

class XKCD {
    constructor(bot) {
		this.bot=bot;
		this.initialize();
		this.interval=null;
        this.schedule();
    }
    
	save(){
		Encrypt.write(xkcddb, JSON.stringify(this.bot.channelsWhoLikeXKCD));
		console.log("Saved XKCD Data");
	}
	
	initialize(){
		var tis = this;
		Encrypt.read(xkcddb, function(data, filename) {
            tis.bot.channelsWhoLikeXKCD = JSON.parse(data);
			console.log("Initialized "+Object.keys(tis.bot.channelsWhoLikeXKCD).length + " XKCD channels");
        });
	}
	
    schedule() {
		if(!this.interval){
			clearInterval(this.interval);
		}
		
		var tis = this;
        this.interval = setInterval(function() {
			console.log("Running timeout xkcd function");
            let now = new Date();
            if (now.getHours() == 20 && (now.getDay()&1)) {
				for(var channel in tis.bot.channelsWhoLikeXKCD){
					tis.post(tis.bot.client.Channels.get(channel));
				}
				console.log("pushed out xkcds");
            }
			//set to 60 for testing
        }, 1000 * 60*60);
    }
    
    post(channel, id) {
        id = id || "";
        if (id.match(/\d+/)) {
            Skarm.sendMessageDelay(channel, "https://xkcd.com/" + id + "/");
			return;
        } 
		if (id == "") {
            Skarm.sendMessageDelay(channel, "https://xkcd.com/");
			return;
        }
		Skarm.sendMessageDelay(channel, "still working on the title lookup");
		return;
    }
	
	
}

module.exports = XKCD;