"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");
const Encrypt = require("./encryption.js");

const xkcddb = "..\\skarmData\\xkcd.penguin";

class XKCD {
    constructor(bot,instance) {
		this.bot=bot;
		this.initialize();
		this.interval=null;
        this.schedule();
		this.lock=0;
		this.instance=instance;
    }
    
	save(){
		Encrypt.write(xkcddb, JSON.stringify(this.bot.channelsWhoLikeXKCD));
		console.log("Saved XKCD Data");
	}
	
	initialize(){
		var tis = this;
		Encrypt.read(xkcddb, function(data, filename) {
            tis.bot.channelsWhoLikeXKCD = JSON.parse(data);
			console.log("Initialized "+Object.keys(tis.bot.channelsWhoLikeXKCD).length + " XKCD channels on Instance "+tis.instance);
        });
	}
	
	poisonPill(){
		clearInterval(this.interval);
	}
	
    schedule() {
		if(!this.interval){
			clearInterval(this.interval);
		}
        this.interval = setInterval(this.sweep, 1000 * 60*60);
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
	
	sweep(n) {
		var d = new Date(); // for now
		var datetext = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
		console.log("Running xkcd.sweep function on Instance "+this.instance +"\tCurrent time: "+datetext);
		let now = new Date();
		if (this.lock <1 &&(n || now.getHours() == 20 && (now.getDay()&1))) {
			this.lock = 3 + ((n)?10:0);
			for(var channel in this.bot.channelsWhoLikeXKCD){
				this.post(this.bot.client.Channels.get(channel));
			}
			console.log("pushed out xkcds");
		}
	}
}

module.exports = XKCD;