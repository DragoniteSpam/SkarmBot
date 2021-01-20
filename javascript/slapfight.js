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
        
        this.running = false;
        this.bot = bot;
        this.channel = channel;
        
        Skarm.sendMessageDelay(channel, "Slapfight has started. Join by " +
            "using the same command! When ready, the fight organizer can " +
            "begin the battle with `e!slapfight begin`."
        );
    };
    
    join(contestant) {
        if (this.running) {
            Skarm.sendMessageDelay(this.channel, "You can't join a slapfight " +
                "that's already in progress! How unsporting! Better wait for " +
                "the next one."
            );
        } else {
            this.participants[contestant] = {
                participant: this.bot.client.Users.get(contestant),
                cooldown: 0,
                health: STARTING_HEALTH,
            };
        }
    };
    
    begin(contestant) {
        this.running = true;
    };
    
    end(contestant) {
        Skarm.sendMessageDelay(this.channel, "The slap fight has been called " +
            "of. Perhaps some other time!"
        );
        // todo
    };
}

module.exports = SlapFight;