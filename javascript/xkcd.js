"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");

class XKCD {
    constructor() {
        this.schedule();
    }
    
    schedule() {
        setTimeout(function() {
            let now = Date.now();
            if (now.getHours() == 19 && (now.getDay() == 1 || now.getDay() == 3 || now.getDay() == 5)) {
                this.post();
            }
            this.schedule();
        }, 1000 * 3600);
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