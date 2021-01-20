"use strict";
const fs = require("fs");

const Skarm = require("./skarm.js");
const Guild = require("./guild.js");
const User = require("./user.js");

class SlapFight {
    constructor(challenger, opponent, channel) {
        this.challenger = challenger;
        this.opponent = opponent;
        this.health = { };
        this.health[challenger] = 10;
        this.health[opponent] = 10;
        Skarm.sendMessageDelay(channel, "Battle started: **" + challenger.name +
            "** vs. **" + opponent.name + "!**");
    };
}

module.exports = SlapFight;