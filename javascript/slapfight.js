"use strict";
const fs = require("fs");

const Skarm = require("./skarm.js");
const Guilds = require("./guild.js");
const Users = require("./user.js");

const STARTING_HEALTH = 10;
const SLAP_VERBS = [
    "slap", "whack", "bonk", "bop",
];

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
        
        Skarm.sendMessageDelay(channel, "Slap fight has been started by **" +
            this.organizer.username + ".** Join by using the same command! " +
            "When ready, the fight organizer can begin the battle with " +
            "`e!slapfight begin`."
        );
    };
    
    join(contestant) {
        if (this.running) {
            Skarm.sendMessageDelay(this.channel, "You can't join a slap " +
                "fight that's already in progress! How unsporting! Better " +
                "wait for the next one."
            );
        } else {
            if (this.participants[contestant]) {
                Skarm.sendMessageDelay(this.channel, "**" +
                    this.participants[contestant].participant.username +
                    ",** you are already part of the fight!"
                );
            } else {
                this.participants[contestant] = {
                    participant: this.bot.client.Users.get(contestant),
                    cooldown: 0,
                    health: STARTING_HEALTH,
                };
                Skarm.sendMessageDelay(this.channel, "**" +
                    this.participants[contestant].participant.username +
                    "** has joined in the slap fight!"
                );
            }
        }
    };
    
    begin(contestant) {
        if (this.running) return;
        if (contestant === this.organizer.id) {
            if (Object.keys(this.participants).length === 1) {
                Skarm.sendMessageDelay(this.channel, "There's no point in " +
                    "starting the fight if nobody else has joined it yet!"
                );
            } else {
                this.running = true;
                Skarm.sendMessageDelay(this.channel, "**The slap fight will now " +
                    "begin.** Ready, set, go!"
                );
            }
        } else {
            Skarm.sendMessageDelay(this.channel, "The fight organizer must " +
                "be the one to start the fight!"
            );
        }
    };
    
    end(contestant) {
        if (!this.running) return;
        if (contestant === this.organizer.id) {
            Skarm.sendMessageDelay(this.channel, "The slap fight has been " +
                "called off. Perhaps some other time!"
            );
            Guilds.get(this.channel.guild_id).slapfight = null;
        } else {
            Skarm.sendMessageDelay(this.channel, "Only the fight organizer " +
                "a moderator may call off a slap fight!"
            );
        }
    };
    
    slap(contestant, victim) {
        if (!this.running) return;
        if (!this.participants[contestant]) return;
        if (!this.participants[victim]) return;
        if (this.participants[contestant].cooldown > 0) {
            Skarm.sendMessageDelay(channel, "**" +
                this.participants[contestant].username + ",** you just " +
                "slapped. Give someone else a chance!"
            );
        } else {
            Skarm.sendMessageDelay(channel, "todo: the actual slapping");
        }
    };
    
    update(contestant, params) {
        if (this.running) {
            if (params.length > 0 && params[0] === "end") {
                this.end(contestant);
            } else {
                // probably nothing
            }
        } else {
            if (params.length > 0 && params[0] === "begin") {
                this.begin(contestant);
            } else {
                this.join(contestant);
            }
        }
    };
    
    interpret(message) {
        if (!this.running) return;
        let author = message.author.id;
        let content = message.content;
        if (!this.participants[author]) return;
        let verb = null;
        for (let i = 0; i < SLAP_VERBS.length; i++) {
            if (content.includes(SLAP_VERBS[i])) verb = SLAP_VERBS[i];
        }
        if (!verb) return;
        Skarm.sendMessageDelay(message.channel, "todo: the actual slapping");
    };
}

module.exports = SlapFight;