"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["rolefrequency","rf"],
        params: ["count"],
        usageChar: "!",
        helpText: "Prints out a table of the most frequently appearing roles in the server.  Use parameter count, to specify the amount of roles to include in the table.",
        examples: [
            {command: "e!rolefrequency", effect: "Will cause Skarm to report the most frequent roles in the guild."},
            {command: "e!rf 3", effect: "Will cause Skarm to report the top 3 most frequent roels in the guild."}
        ],
        ignoreHidden: true,
        category: "general",
        //todo: specify only works in guilds
        execute(bot, e, userData, guildData) {
            let param = Skarm.commandParamTokens(e.message.content);
            let tableUpperBound = Infinity;
            if(param.length){
                tableUpperBound = Number(param[0]);
            }
            let guild = e.message.guild;

            //harvest counts from member list
            let members = guild.members;
            let roleFreq = { };
            for(let member of members){
                for(let role of member.roles){
                    if(!(role.id in roleFreq)){
                        roleFreq[role.id] = 0;
                    }
                    roleFreq[role.id]++;
                }
            }

            let roleFreqArray = [ ];
            //convert to array and sort by frequency
            for(let roleID of Object.keys(roleFreq)){
                roleFreqArray.push({
                    id: roleID,
                    freq: roleFreq[roleID],
                });
            }

            roleFreqArray.sort((a,b) => {return b.freq - a.freq});

            //print results
            let printFields = [ ];
            tableUpperBound = Math.min(tableUpperBound, roleFreqArray.length);
            for(let i = 0; i < tableUpperBound; i++){
                printFields.push({name: roleFreqArray[i].freq, value: " <@&"+roleFreqArray[i].id+">", inline: true});
            }

            e.message.channel.sendMessage(" ", false, {
                color: Skarm.generateRGB(),
                timestamp: new Date(),
                title: "Most frequent roles in "+e.message.guild.name,
                fields: printFields,
                footer: {
                    text: e.message.guild.name+ " top " + tableUpperBound,
                },
            });

        },

        help(bot,e) {
            Skarm.help(this, e);
        },
}

