"use strict";
const Skarm = require("./skarm.js");

class Guild {
    static guilds = {};
    
    constructor() {
        this.woe = {
            message: "",
            channel: null,
            
            Guild.add(this);
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
    
    static add(guild) {
        if (guild in Guild.guilds) {
            return false;
        }
        Guild.guilds[guild.id] = guild;
        return true;
    }
    
    static remove(guild) {
        if (!(guild in Guild.guilds) {
            return false;
        }
        delete Guild.guilds[guild.id];
        return true;
    }
    
}

module.exports = Guild;