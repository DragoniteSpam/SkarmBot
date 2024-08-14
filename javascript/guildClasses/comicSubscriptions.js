"use strict";
const fs = require("fs");
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");
const ComicsCollection = require("../comics.js");

Constants.initialize();

/**
 * since the two classes are serialized for Guilds.save, 
 *  setInterval cannot be attached to the object without
 *  causing circular serialization issues.
 */
let subIntervals = {

};

class Subscription {
    /**
     * An instance of a subscription object, tracking a comic-channel pair and their tracking configuration 
     * @param {string} channel The channel ID to send comics to
     * @param {string} comic Which comic (by name) the subscription is made to
     * @param {int} index The position in the comics list of this entry. 
     *                    The value -1 indicates a live subscription feed.  
     *                    Not specifying the parameter will use the default live subscription.
     */
    constructor(channel, comic, index = -1) {
        this.channel = channel;
        this.comic = comic;
        this.index = index;

        if (!this.live()) {
            console.log("Set up catch-up publisher for comic:", this.channel, this.comic);
            let tis = this;
            subIntervals[channel + comic] = setInterval(() => { tis.postCatchup(); }, 1 * Constants.Time.DAYS);
        }
    }

    postCatchup() {
        // catch-up posts are only for non-live comic subscriptions
        if (this.live()) return;

        let comic = ComicsCollection.get(this.comic);
        if (!comic) {
            console.log("Failed to retrieve comic", this.comic, "from comic collection.  Got:", comic);
            return;
        }

        // check if the index has caught up to live yet
        if (comic.length() <= this.index) {
            console.log("Comic has caught up!");
            this.index = -1;
            return;
        }

        // post the next entry in the sequence
        comic.post(this.channel, this.index);

        // move up the pointer
        this.index++;
    }

    live() {
        // indicates if the subscription is to live releases
        // true  --> only notify about new releases
        // false --> post daily entries until caught up to live
        return (this.index === -1);
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
        console.log("Comic channels for guild:", this.subscriptions);
        this.subscriptions
            .filter(sub => sub.comic === comicClass) // publish just this comic class
            .filter(sub => sub.live())             // finding all the subscriptions to the live release only
            .map((sub) => {
                Skarm.spam(`Sending ${comicClass} message to <#${sub.channel}>`);
                Skarm.sendMessageDelay(client.Channels.get(sub.channel), publishingData);
            });
    }

    getSubsFor(channel) {
        return this.subscriptions.filter(sub => sub.channel === channel);
    }

    getSubsTo(comic) {
        return this.subscriptions.filter(sub => sub.comic.toLowerCase() === comic.toLowerCase());
    }

    next(channel, comic){
        let subscription = this.get(channel, comic);
        if(subscription){
            // console.log("Posting catch-up for", subscription);
            subscription.postCatchup();
        } else {
            console.error("No matching subscriptions for", channel, comic);
        }
        // this._get(channel, comic).map(c => c.postCatchup());
    }

    _get(channel, comic) {
        // returns as array with 0 or 1 elements
        return this.subscriptions
        .filter(sub => sub.channel === channel)
        .filter(sub => sub.comic.toLowerCase() === comic.toLowerCase());
    }

    get(channel, comic) {
        // returns as object or null
        return this._get(channel, comic)[0];
    }

    isLive(channel, comic){
        return this._get(channel, comic).filter(c => c.live()).length > 0;
    }

    isSubscribed(channel, comic) {
        return !!this.get(channel, comic);
    }

    subscribe(channel, comic) {
        this.subscriptions.push(new Subscription(channel, comic));
    }

    subscribeAt(channel, comic, index) {
        this.subscriptions.push(new Subscription(channel, comic, index));
    }

    unsubscribe(channel, comic) {
        let unsub = this.get(channel, comic);
        if (unsub.interval) {
            clearInterval(unsub.interval);
        }

        // remove this entity from the list
        this.subscriptions = this.subscriptions
            .filter(sub => sub.channel !== channel)
            .filter(sub => sub.comic.toLowerCase() !== comic.toLowerCase());
    }
}

module.exports = {
    ComicSubscriptions
}
