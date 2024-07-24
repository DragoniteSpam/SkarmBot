/**
 * Autopin
 *
 * This module implements the Autopin class.
 *
 * Autopin will redirect pins once a channel's pin count has reached
 *  capacity over to a user-defined archive channel.
 * 
 */

"use strict";
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");
const Guilds = require("../guild.js");

const DISABLED_FLAG = "DISABLED";
const MAX_PIN_COUNT = 50; // default max mins

let linkVariables = function (autoPin) {
    autoPin.directForwarding ??= { };
    autoPin.defaultForward   ??= undefined;
    autoPin.maxPinCount      ??= MAX_PIN_COUNT;
    autoPin.enabled          ??= true;
    autoPin.guildId          ??= "object recovered by linker.  Field unrecoverable.";
}

let linkFunctions = function (autoPin){
    autoPin.getForward = function(channelId){
        let forward = autoPin.enabled && autoPin.getDirectForward(channelId) || autoPin.getDefaultForward();
        if (forward !== DISABLED_FLAG){
            return forward;
        }
    };

    autoPin.setDirectForward = function (source, destination) {
        autoPin.directForwarding[source] = destination;
    };

    autoPin.getDirectForward = function(channelId) {
        return autoPin.directForwarding[channelId];
    }

    autoPin.isChannelEnabled = function (channelId) {
        let dst = autoPin.directForwarding[channelId];
        return dst && dst !== DISABLED_FLAG;
    }

    autoPin.disableDirectForward = function (channelId) {
        let fwd = autoPin.getDirectForward(channelId);
        if (fwd) {
            delete autoPin.directForwarding[channelId];
        } else {
            autoPin.directForwarding[channelId] = DISABLED_FLAG;
        }
    }

    autoPin.enable = function () {autoPin.enabled = true;};
    autoPin.disable = function () {autoPin.enabled = false;};
    autoPin.isEnabled = function () {return autoPin.enabled};

    autoPin.setDefaultForward = function(channelID) {
        autoPin.defaultForward = channelID;
    };

    autoPin.getDefaultForward = function () {
        return autoPin.enabled && autoPin.defaultForward;
    };

    autoPin.clearDefaultForward = function () {
        autoPin.defaultForward = undefined;
    };

    autoPin.clearForwardingTable = function () {
        autoPin.directForwarding = { };
    };

    autoPin.getFullForwardingTable = function () {
        return Object.assign({ }, autoPin.directForwarding);
    };

    autoPin.cycleAll = function () {
        let iGuild = Constants.client.Guilds.get(autoPin.guildId);
        for(let channel of iGuild.textChannels) {
            autoPin.cyclePins(channel);
        }
    };

    autoPin.cyclePins = function (channelObj) {
        if (!Skarm.hasMessageAccess(channelObj)) return;
        if (!autoPin.enabled) return;
        let destination = autoPin.getForward(channelObj.id);
        if (!destination) return;
        if (!channelObj) return;

        channelObj.fetchPinned().then(response => {
            let pins = response.messages;
            // console.log(`${pins.length}/${autoPin.maxPinCount} pins in channel ${channelObj.name}`);
            if(pins.length < autoPin.maxPinCount) return;
            let oldestPin = pins[pins.length-1];
            oldestPin.unpin();

            let messageLink = `https://discord.com/channels/${oldestPin.guild.id}/${oldestPin.channel.id}/${oldestPin.id}`;
            let description = `Link: ${messageLink}\n\n${oldestPin.content}\n`;

            let imageUrl = undefined;
            if(oldestPin.attachments && oldestPin.attachments.length){
                let attachmentStr = "\n\nAttachments:\n";
                for(let attachment of oldestPin.attachments) {
                    // console.log(attachment);
                    attachmentStr += attachment.url + "\n";
                    if (attachment.content_type.includes("image")) {
                        imageUrl = attachment.url;
                    }
                }
                description += attachmentStr;
            }

            Skarm.sendMessage(destination, " ", false, {
                // Create elegant pinned message body
                // https://discordjs.guide/popular-topics/embeds.html#embed-preview
                description: description,
                author: {
                    name: oldestPin.author.username,
                },
                thumbnail: {
                    url: oldestPin.author.avatarURL,
                },
                image: {
                    url: imageUrl,
                },
                timestamp: oldestPin.timestamp,
            });

            // wait 30 seconds to try again in case still over the upper bound
            setTimeout(()=>{
                autoPin.cyclePins(channelObj);
            }, 1000 * 30); 
        });
    };

    autoPin.setMaxPins = function (pinMax){
        // returns true only if the operation succeeds
        pinMax = Number(pinMax);
        if(!Number.isInteger(pinMax)) return false; // invalid input
        if(pinMax < 0 || pinMax > MAX_PIN_COUNT) return false; // invalid input
        autoPin.maxPinCount = Math.floor(pinMax);
        return true;
    };
}

class AutoPin {

    constructor(guildId) {
        /**
         * A table that maps source channels to destination channels or "disabled"
         */
        this.directForwarding = { };

        /**
         * The default channel ID to which messages should be forwarded
         *  if a direct forwarding doesn't exist for that channel
         */
        this.defaultForward = undefined;

        /**
         * maxPinCount
         *  The maximum number of pins in this guild before 
         *  they are redirected to the overflow channel
         */
        this.maxPinCount = MAX_PIN_COUNT;

        /**
         * Global enable/disable for the class instance.
         * No actions will be taken if enabled is not set to true.
         */
        this.enabled = true;

        /**
         * A copy of the guild ID to be able to reassociate 
         *   lost data structure components
         */
        this.guildId = guildId; // the GUID of the guild

        AutoPin.initialize(this);
    }

    static initialize(autoPin){
        linkVariables(autoPin);
        linkFunctions(autoPin);
    }
}

module.exports = AutoPin;
