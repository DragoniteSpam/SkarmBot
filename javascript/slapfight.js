"use strict";
const fs = require("fs");

const Skarm = require("./skarm.js");
const Guild = require("./guild.js");
const User = require("./user.js");

const STARTING_HEALTH = 10;

class SlapFight {
    constructor(bot, organizer, channel) {
        this.participants = { };
        
        this.organizer = bot.client.Users.get(organizer);
        this.participants[organizer] = {
            participant: this.organizer,
            cooldown: 0,
            health: STARTING_HEALTH,
        };
        
        this.channel = channel;
        
        Skarm.sendMessageDelay(channel, "Slapfight has started. Join by " +
            "using the same command! When ready, the fight organizer can " +
            "begin the battle with `e!slapfight begin`."
        );
    };
}

module.exports = SlapFight;