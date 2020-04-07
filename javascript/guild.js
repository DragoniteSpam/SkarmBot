"use strict";
const Skarm = require("./skarm.js");

class Guild {
    // assume we are connected
    constructor() {
        this.woe = {
            message: "",
            channel: null,
        };
        
        this.mayhem = {
            roles: [],
            hue: 0,
        };
    }
    
    sendWoeMessage(user) {
        // for best results, the woe message should be formatted something like:
        // "Yo, {user.username}! If you can see this, it means you've been
        // restricted from using the server."
        Skarm.sendMessageDelay(this.woe.channel, this.woe.message);
    }
}

module.exports = Guild;