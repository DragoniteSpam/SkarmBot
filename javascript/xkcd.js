"use strict";
const fs = require("fs");
const Skarm = require("./skarm.js");

class XKCD {
    constructor() {
        setInterval(this.evalPost, 1000 * 3600);
    }
    
    evalPost() {
        let now = new Date();
        if (now.getHours() == 21 && (now.getDay() == 1 || now.getDay() == 3 || now.getDay() == 5)) {
            this.post();
        }
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