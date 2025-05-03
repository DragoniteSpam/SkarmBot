/**
 * Guild Icon Scheduled Rotator
 */

"use strict";
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");
const Permissions = require("../permissions.js");
const Skinner = require("../skinnerbox.js");
const User = require("../user.js");
const { parseCronExpression } = require("cron-schedule");

/**
 * since classes are serialized for Guilds.save, 
 *  setInterval cannot be attached to the object without
 *  causing circular serialization issues.
 * 
 * It also doesn't need to be saved as it gets reset when skarm restarts
 */
let subIntervals = {};

class Icon {
    constructor(self) {
        this.cron = self.cron || "";
        this.url = self.url || "";
        this.name = self.name || "";
    }

    isValidCron() {
        try {
            return parseCronExpression(this.cron); // truthy object
        } catch (error) {
            return null; // falsy null
        }
    }

    isValidUrl() {
        if (!this.url) return false;
        return isValidUrl(this.url);
    }

    isValidIcon() {
        if (!this.isValidCron()) return "Bad cron";
        if (!this.isValidUrl()) return "Bad URL";
        return true;
    }

    async uploadToGuild(guildId) {
        let guild = Constants.client.Guilds.get(guildId);
        let name = undefined;
        let icon = this.isValidUrl();
        if (!icon) return;

        // format URL to get the buffer response back
        let url = `${icon}.png`;

        // load the buffer
        let response = await fetch(url);
        let aBuffer = await response.arrayBuffer();
        let buffer = Buffer.from(aBuffer);

        // TODO: check for perms

        // upload the icon to discord
        await guild.edit(name, buffer);
        return true;
    }

    isDue(fromDate = new Date()) {
        let cron = this.isValidCron();
        let now = new Date();
        if (cron.getNextDate(fromDate) <= now) {
            return true;
        }
        return false;
    }

    nextScheduledTime() {
        let cron = this.isValidCron();
        return cron?.getNextDate()?.toLocaleString('sv');
    }
}

class IconRotator {
    constructor(self, guildId) {
        self ??= {}; // for initialization
        this.channels = self.channels || [];                  // list of channel ID's
        this.lastUpdatedTime = self.lastUpdatedTime || 0;     // Unix timestamp of last run
        this.enabled = self.enabled || true;                  // turns the feature on and off without data destruction
        this.icons = (self.icons || []).map(i => new Icon(i));
        this.guildId = guildId;

        // initial rotation after a presumed outage or update
        this.catchUp();

        // run every hour just to make sure we cover everyone in case of an outage
        // this is being run every hour as a lower bound in order to avoid any troublemaking with discord's rate limits
        // this also allows us to avoid having to clear any intervals when schedules are edited
        let tis = this;
        subIntervals[guildId] = setInterval(() => {
            tis.rotate();
        }, 1 * Constants.Time.HOURS);
    }

    getValidIcons() {
        return this.icons
            .filter(icon => !!icon)
            .filter(icon => icon.isValidUrl())
            .filter(icon => icon.isValidCron());
    }

    getNextState() {
        let validIcons = this.getValidIcons();
        let next = validIcons.map(icon => {
            let cron = icon.isValidCron();
            let date = cron.getNextDate(new Date);
            return { cron, date, icon };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

        let upcomingTime = next.date;
        let nextState = next.icon;

        return {nextState, upcomingTime};
    }

    getCurrentState() {
        let validIcons = this.getValidIcons();
        // console.log(`[IconRotator] catching up among ${validIcons.length} valid icons`);
        return validIcons
            .map(icon => {
                let cron = icon.isValidCron();
                let date = cron.getPrevDate(new Date);
                return { cron, date, icon };
            })
            .sort((a, b) => {
                let diff = b.date.getTime() - a.date.getTime();
                // console.log("Diff:", diff, a.icon.name, b.icon.name);
                return diff;
            })
            .map(tuple => tuple.icon)[0];
    }

    async catchUp() {
        if (!this.enabled) return;
        let response = this.getCurrentState()?.uploadToGuild(this.guildId);
        this.updateTimestamp(response);
    }

    async rotate() {
        if (!this.enabled) return;

        let response = this.getValidIcons()
            .find(icon => icon.isDue(new Date(this.lastUpdatedTime)))
            ?.uploadToGuild(this.guildId);

        this.updateTimestamp(response);
    }

    async updateTimestamp(response) {
        if (!response) return;

        // if an upload was made, update the last updated timestamp
        if (await response) {
            this.lastUpdatedTime = Date.now();
        }
    }
}

function isValidUrl(url) {
    // imgur-only URLs
    let regex = /https:\/\/imgur\.com\/[\w]+/;
    console.log(`Matching ${url} against ${regex}`);
    let match = url.match(regex);
    console.log(`Result: ${match}`);
    return match?.[0];
}

module.exports = {
    IconRotator,
    Icon,
    isValidUrl
};
