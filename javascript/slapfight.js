"use strict";
const fs = require("fs");

const Skarm = require("./skarm.js");
const Guild = require("./guild.js");
const User = require("./user.js");

const STARTING_HEALTH = 10;

class SlapFight {
    constructor(challenger, opponent, channel) {
        this.challenger = challenger;
        this.opponent = opponent;
        this.health = { };
        this.health[challenger] = STARTING_HEALTH;
        this.health[opponent] = STARTING_HEALTH;
        this.currentTurn = null;
        this.channel = channel;
        Skarm.sendMessageDelay(channel, "Battle started: **" + challenger.name +
            "** vs. **" + opponent.name + "!**");
    };
}

module.exports = SlapFight;