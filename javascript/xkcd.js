"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");

class XKCD {
    constructor() {
        this.channels = [];
        this.latestDate = new Date();
        this.timeout = null;
        
        this.load();
    }
    
    save() {
        var required = {
            latestDate: this.latestDate,
            latestIndex: this.latestIndex,
        };
        
        fs.writeFile(".\\data\\xk.cd", JSON.stringify(required), function(err) {
            if (err) {
                Skarm.log("failed to write out the xkcd data for some reason");
            }
        });
    }
    
    load() {
        let loaded = { };
        if (fs.existsSync(".\\data\\xk.cd")) {
            loaded = JSON.parse(fs.readFileSync(".\\data\\xk.cd").toString());
        }
        
        loaded.latestDate = loaded.latestDate || Date.now();
        loaded.latestIndex = loaded.latestIndex || 2343;
        
        this.latestDate = loaded.latestDate;
        this.latestIndex = loaded.latestIndex;
        
        //this.schedule();
    }
    
    post(channel, id) {
        id = id || "";
        if (id.match(/\d+/)) {
            Skarm.sendMessageDelay(channel, "https://xkcd.com/" + id + "/");
        } else if (id == "") {
            Skarm.sendMessageDelay(channel, "https://xkcd.com/");
        } else {
            Skarm.sendMessageDelay(channel, "still working on the title lookup");
        }
    }
}

module.exports = XKCD;