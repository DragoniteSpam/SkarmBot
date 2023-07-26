"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["autopin"],
        params: ["[#destination-channel | disable | clear]", "[-u]", "[-a]"],
        usageChar: "@",
        helpText: "Configuration for AutoPin feature.  When a channel reaches the maximum amount of pinned messages (50), the oldest pin in the channel will be removed from the pins collection, and a copy of it with a link to the original will be sent in a destination channel.  This command configures the AutoPin utility.",
        examples: [
            {command: "e@autopin", effect: "Displays a list of all currently active channel forwarding configurations."},
            {command: "e@autopin #pins-to-the-past", effect: "Sets the destination channel for overflow pins to be sent to when overflowing in this channel."},
            {command: "e@autopin #pins-to-the-past -a", effect: "Sets the default destination channel for overflow pins to be sent to when overflowing for ALL channels in the server. WARNING: this includes private channels that Skarm has access to.  Any previously existing overrides will be cleared."},
            {command: "e@autopin #pins-to-the-past -u", effect: "Sets the default destination channel for overflow pins to be sent to when overflowing for all unassigned channels in the server.  This will not clear previously existing overrides including `disable`."},
            {command: "e@autopin disable", effect: "Deletes the destination set for this channel.  If a destination already did not exist, disables forwarding to the default pinning channel."},
            {command: "e@autopin disable -u", effect: "Deletes the default destination for ALL channels.  Specialized mappings will not be affected."},
            {command: "e@autopin disable -a", effect: "Disables this utility without erasing any existing mappings."},
            {command: "e@autopin clear", effect: "Deletes all specialized destinations and the default destination.  WARNING: this will destroy all previously existing configurations.  This cannot be reverted."},
        ],
        ignoreHidden: false,
        perms: Permissions.MOD,
        category: "administrative",

        execute(bot, e, userData, guildData) {
            let tokens = Skarm.commandParamString(e.message.content);

            if (tokens.length === 0) {
                let forwardsString = "";
                let forwards = guildData.autoPin.getFullForwardingTable();
                let defaultFwd = guildData.autoPin.getDefaultForward();
                if(Object.keys(forwards).length || defaultFwd){
                    for(let src in forwards){
                        forwardsString += `<#${src}> --> <#${forwards[src]}>\n`;
                    }
                    if(defaultFwd) {
                        forwardsString += `All other channels forward to: <#${defaultFwd}>`;
                    }
                } else {
                    forwardsString += "No channels are currently configured.\n";
                }

                forwardsString += `Enabled: \`${guildData.autoPin.isEnabled()}\``;
                // https://discordjs.guide/popular-topics/embeds.html#embed-preview
                Skarm.sendMessageDelay(e.message.channel, " ", false, {
                    title: "Autopin Configuration",
                    description: forwardsString,
                    footer: {
                        text: e.message.guild.name,
                        icon_url: e.message.guild.iconURL,
                    },
                });
                return;
            }

            let arg0 = tokens.shift();
            if (arg0 === "clear") {
                // todo
                return;
            }

            if (arg0 === "disable") {
                // todo
                return;
            }

            let channelID = Skarm.extractChannel(arg0);
            if (channelID) {
                // todo
                return;
            }

            Skarm.sendMessageDelay(e.message.channel, "Invalid argument is not channel, `clear`, or `disable`:" + arg0);
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}
