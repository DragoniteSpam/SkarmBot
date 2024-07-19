"use strict";
const fs = require("fs");
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");

class Subscription {
    /**
     * An instance of a subscription object, tracking a comic-channel pair and their tracking configuration 
     * @param {string} channelID The channel to send comics to
     * @param {string} comic Which comic (by name) the subscription is made to
     * @param {int} index The position in the comics list of this entry. 
     *                    The value -1 indicates a live subscription feed.  
     *                    Not specifying the parameter will use the default live subscription.
     */
    constructor(channel, comic, index = -1) {
        this.channel = channel;
        this.comic = comic;
        this.index = index;
    }

    live() {
        // indicates if the subscription is to live releases
        // true  --> only notify about new releases
        // false --> post daily entries until caught up to live
        return (index === -1);
    }

    equals(other) {
        // check if two subscriptions are the same channel+comic pair
        if (this.channel !== other.channel) return false;
        if (this.comic !== other.comic) return false;
        return true;
    }
}

class ComicSubscriptions {
    constructor(oldChannels, self) {
        this.subscriptions = [];

        // import legacy properties
        if (oldChannels) {
            for (let comic in oldChannels) {
                let channels = Object.keys(oldChannels[comic]);
                for (let channelID of channels) {
                    this.subscriptions.push(new Subscription(channelID, comic));
                }
            }
        }

        // merge with self
        if (self) {
            for (let sub of self.subscriptions) {
                this.subscriptions.push(new Subscription(sub.channel, sub.comic, sub.index));
            }
        }
    }

    notify(client, comicClass, publishingData) {
        console.log("Comic channels for guild:", guild.id, guild.comicChannels);
        this.subscriptions
            .filter(sub => sub.comic === comicClass) // publish just this comic class
            .filter(sub => sub.live())             // finding all the subscriptions to the live release only
            .map((sub) => {
                Skarm.spam(`Sending ${comicClass} message to <#${sub.channel}>`);
                Skarm.sendMessageDelay(client.Channels.get(sub.channel), publishingData);
            });
    }
}

module.exports = {
    ComicSubscriptions
}
