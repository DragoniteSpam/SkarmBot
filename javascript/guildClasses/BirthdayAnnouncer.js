/**
 * Birthday announcer
 */

"use strict";
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");
const Permissions = require("../permissions.js");
const Skinner = require("../skinnerbox.js");
const User = require("../user.js");

/**
 * since classes are serialized for Guilds.save, 
 *  setInterval cannot be attached to the object without
 *  causing circular serialization issues.
 * 
 * It also doesn't need to be saved as it gets reset when skarm restarts
 */
let subIntervals = {};


class BirthdayAnnouncer {
    constructor(self, guildId) {
        self ??= {}; // for initialization
        this.channels = self.channels || [];  // list of channel ID's
        this.lastRun = self.lastRun || "0000-00-00";
        this.guildId = guildId;
        let tis = this;
        subIntervals[guildId] = setInterval(() => {
            tis.announce();
        }, 1 * Constants.Time.HOURS);  // run every hour just to make sure we cover everyone in case of an outage
    }

    enable(channelId){
        /**
         * @returns true if the channel was added, false if it was already present
         */
        if(this.channels.includes(channelId)){
            return false;
        }
        this.channels.push(channelId);
        return true;
    }

    disable(channelId){
        /**
         * @returns true if the channel was removed, false if it wasn't there before
         */
        if(!this.channels.includes(channelId)){
            return false;
        }
        this.channels = this.channels.filter(id => id !== channelId); // filter out the ID
        return true;
    }

    async announce() {
        console.log("Performing announcement cycle");
        
        // extract the month and day from today's date
        let unix = Date.now() - (new Date()).getTimezoneOffset() * Constants.Time.MINUTES;
        let today = (new Date(unix)).toISOString().split("T")[0];
        let monthDayString = today.substring(4);

        // make sure you don't run twice on the same day
        if(! (today > this.lastRun)) {
            // already ran today, don't need to do anything in this scenario
            console.log("Already checked for birthdays in server", this.guildId, "skipping...");
            return;
        }

        // find the proper members
        let enMem = this.getEnabledMembers();
        let members = enMem
            .filter(sUser => sUser.birthday.includes(monthDayString));   // extract just the users whose birthday is today (matches month and day)
        console.log(`Found ${members.length} whose birthday is today from ${enMem.length} enabled guild members!`)

        // send celebratory messages
        for (let bdMember of members) {
            for (let channel of this.channels) {
                await Skarm.sendMessageDelay(channel, `Happy Birthday <@${bdMember.id}>! ${this.getRandomEmojis(5)}`);
            }
        }

        // update the last time this was done to today!
        this.lastRun = today;

    }

    getEnabledMembers(){
        let guild = Constants.client.Guilds.get(this.guildId);
        let members = guild.members                     // get all the members in the discord guild
            .map(member => User.get(member.id))         // match them to skarm's User class instances
            .filter(sUser => sUser.birthday && sUser.birthdayAllowedGuilds[this.guildId]);   // extract just the ones that agreed to announce their birthdays here and have actually set a date
        return members;
    }

    getRandomEmojis(num){
        return (new Array(num).fill("")).map(_ => this.getRandomBdayEmoji()).join(" ");
    }

    getRandomBdayEmoji() {
        let emojis = [
            ":birthday:",
            ":partying_face:",
            ":confetti_ball:",
            ":tada:",
            ":sparkler:",
        ];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
}

module.exports = BirthdayAnnouncer;
