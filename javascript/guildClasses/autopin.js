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

const disabledFlag = "DISABLED";
const MAX_PIN_COUNT = 50;

let linkVariables = function (autoPin) {
    autoPin.directForwarding ??= { };
    autoPin.defaultForward   ??= undefined;
    autoPin.enabled          ??= true;
    autoPin.guildId          ??= "object recovered by linker.  Field unrecoverable.";
}

let linkFunctions = function (autoPin){
    autoPin.getForward = function(channelId){
        let forward = autoPin.enabled && autoPin.directForwarding[channelId] || autoPin.getDefaultForward();
        if (forward !== disabledFlag){
            return forward;
        }
    };

    autoPin.setForward = function (source, destination) {
        autoPin.directForwarding[source] = destination;
    };

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
    }

    autoPin.cyclePins = function (channelObj) {
        if (!autoPin.enabled) return;
        let destination = autoPin.getForward(channelObj.id);
        if(!destination) return;

        channelObj.fetchPinned().then(response => {
            let pins = response.messages;
            if(pins.length < MAX_PIN_COUNT) return console.log(`${pins.length}/${MAX_PIN_COUNT} pins in channel ${channelObj.name}`); 
            let oldestPin = pins[pins.length-1];

            oldestPin.unpin();
            Skarm.sendMessage(destination, " ", false, {
                // todo: elegant pinned message body
                // https://discordjs.guide/popular-topics/embeds.html#embed-preview
                description: oldestPin.content,
                author: {
                    name: `<@${oldestPin.author.id}>`,
                },
                footer: `<#${channelObj.id}>`,
            });
        });
    }
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
