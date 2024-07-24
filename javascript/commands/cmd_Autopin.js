"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["autopin"],
        params: ["[#destination-channel | enable | disable | clear]", "[-u(nassigned)]", "[-a(ll)]"],
        usageChar: "@",
        helpText: "Configuration for AutoPin feature.  When a channel reaches the maximum amount of pinned messages (50), the oldest pin in the channel will be removed from the pins collection, and a copy of it with a link to the original will be sent in a destination channel.  This command configures the AutoPin utility.",
        examples: [
            {command: "e@autopin", effect: "Displays a list of all currently active channel forwarding configurations."},
            {command: "e@autopin #pins-to-the-past", effect: "Sets the destination channel for overflow pins to be sent to when overflowing in this channel."},
            {command: "e@autopin #pins-to-the-past -a", effect: "Sets the default destination channel for overflow pins to be sent to when overflowing for ALL channels in the server. WARNING: this includes private channels that Skarm has access to.  Any previously existing overrides will be cleared."},
            {command: "e@autopin #pins-to-the-past -u", effect: "Sets the default destination channel for overflow pins to be sent to when overflowing for all unassigned channels in the server.  This will not clear previously existing overrides including `disable`."},
            {command: "e@autopin clear", effect: "Deletes the destination set for this channel.  If a destination already did not exist, disables forwarding to the default pinning channel.  If all forwarding is already disabled, removes this local disable."},
            {command: "e@autopin clear -u", effect: "Deletes the default destination for ALL channels.  Specialized mappings will not be affected."},
            {command: "e@autopin clear -a", effect: "Deletes all specialized destinations and the default destination.  WARNING: this will destroy all previously existing configurations.  This cannot be reverted."},
            {command: "e@autopin disable", effect: "Disables this utility without erasing any existing mappings."},
            {command: "e@autopin enable", effect: "Re-enables this utility without erasing any existing mappings."},
            {command: "e@autopin max 10", effect: "Sets the maximum pin count to 10.  All channels with more than 10 pinned messages will have their overflow pins transferred."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamTokens(e.message.content);
            let ap = guildData.autoPin;
            let srcChannel = e.message.channel;

            function sendDefaultResponse () {
                let forwardsString = "";
                let forwards = ap.getFullForwardingTable();
                let defaultFwd = ap.getDefaultForward();
                if(Object.keys(forwards).length || defaultFwd){
                    for(let src in forwards){
                        if(ap.isChannelEnabled(src)) {
                            forwardsString += `<#${src}> --> <#${forwards[src]}>\n`;
                        } else {
                            forwardsString += `<#${src}> will not auto-archive messages\n`;
                        }
                    }
                    if(defaultFwd) {
                        forwardsString += `All other channels forward to: <#${defaultFwd}>\n`;
                    }
                } else {
                    forwardsString += "No channels are currently configured.\n";
                }

                forwardsString += `Maximum pin count: \`${ap.maxPinCount}\``;
                forwardsString += `Enabled: \`${ap.isEnabled()}\``;
                // https://discordjs.guide/popular-topics/embeds.html#embed-preview
                Skarm.sendMessageDelay(srcChannel, " ", false, {
                    title: "Autopin Configuration",
                    description: forwardsString,
                    footer: {
                        text: e.message.guild.name,
                        icon_url: e.message.guild.iconURL,
                    },
                });
            }

            if (tokens.length === 0) {
                sendDefaultResponse();
                return;
            }

            let arg0 = tokens.shift();
            if (arg0 === "enable") {
                ap.enable();
                ap.cycleAll();
                sendDefaultResponse();
                return;
            }

            if (arg0 === "disable") {
                ap.disable();
                sendDefaultResponse();
                return;
            }
            
            if (arg0 === "clear") {
                let flag = tokens.shift();
                if (flag === undefined) {
                    ap.disableDirectForward(srcChannel.id);
                }
                if (flag === "-u") {
                    ap.clearDefaultForward();
                }
                if (flag === "-a") {
                    ap.clearDefaultForward();
                    ap.clearForwardingTable();
                }
                sendDefaultResponse();
                return;
            }

            if (arg0 === "max"){
                let success;
                if(tokens.length === 1){
                    success = ap.setMaxPins(tokens[0]);
                }
                if(success){
                    sendDefaultResponse();
                } else {
                    Skarm.sendMessageDelay(srcChannel, `Invalid input: ${tokens}`);
                }
                return;
            }

            let destinationChannelID = Skarm.extractTextChannel(arg0);
            if (destinationChannelID) {
                let flag = tokens.shift();
                if (flag === undefined) {
                    ap.setDirectForward(srcChannel.id, destinationChannelID);
                    ap.cyclePins(srcChannel);
                }
                if (flag === "-u") {
                    ap.setDefaultForward(destinationChannelID);
                    ap.cycleAll();
                }
                if (flag === "-a") {
                    ap.setDefaultForward(destinationChannelID);
                    ap.clearForwardingTable();
                    ap.cycleAll();
                }
                sendDefaultResponse();
                return;
            }

            Skarm.sendMessageDelay(srcChannel, "Invalid argument is not text channel, `clear`, `max #`, `enable`, or `disable`:" + arg0);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}
