/**
 * Guild Icon Scheduled Rotator
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
        let regex = /https:\/\/imgur\.com\/[\w]+/; // imgur-only URLs
        if (!this.name) return false;
        let match = this.name.match(regex);
        return match?.[0];
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

    nextScheduledTime(){
        let cron = this.isValidCron();
        return cron.getNextDate().toLocaleString('sv');
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
        this.rotate();

        // run every hour just to make sure we cover everyone in case of an outage
        // this is being run every hour as a lower bound in order to avoid any troublemaking with discord's rate limits
        // this also allows us to avoid having to clear any intervals when schedules are edited
        let tis = this;
        subIntervals[guildId] = setInterval(() => {
            tis.rotate();
        }, 1 * Constants.Time.HOURS);  
    }

    rotate() {
        if(!this.enabled) return;

        let response = this.icons
            .filter(icon => !!icon)
            .filter(icon => icon.isValidCron())
            .filter(icon => icon.isValidUrl())
            .find(icon => icon.isDue(new Date(this.lastUpdatedTime)))
            ?.uploadToGuild(this.guildId);

        // if an upload was made, update the last updated timestamp
        response?.then(changed => {
            if (changed) {
                this.lastUpdatedTime = Date.now();
            }
        });
    }
}

module.exports = IconRotator;
