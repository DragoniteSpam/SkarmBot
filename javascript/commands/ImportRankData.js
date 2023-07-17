"use strict";
const {os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection} = require("./_imports.js");

module.exports = {
        aliases: ["importrankdata", "ird"],
        params: [],
        usageChar: "@",
        helpText: "This command takes a single input csv attachment and sets the experience values of all usernames in the guild that appear in the csv file to the exp values on the csv file." +
            "  Expected CSV format of header: " + `"username","level","exp","msgs"`,
        examples: [
            {command: "e@ird", effect: "Takes the csv file attached to the message and assigns each user in the csv file their associated experience."}
        ],
        ignoreHidden: true,
        category: "leveling",
        perms: Permissions.MOD,

        execute(bot, e, userData, guildData) {
            let channel = e.message.channel;
            let attachments = e.message.attachments;
            console.log(JSON.stringify(attachments));
            if(attachments.length === 1){
                Skarm.sendMessageDelay(channel, `Processing file :\`${attachments[0].filename}\``);
                let params = {
                    timeout: 2000,
                    followAllRedirects: true,
                    uri: attachments[0].url,
                };

                request.get(params, (error, response, body) => {
                    if(error || response.statusCode !== 200){
                        Skarm.sendMessageDelay(channel, `Uh-oh, something went wrong.  I got the error code: ${response.statusCode}\n ${JSON.stringify(error)}`);
                        return;
                    }
                    let lines = body.split("\n");
                    let expectedHeader = `"username","level","exp","msgs"`;
                    if(!lines[0].includes(expectedHeader)){
                        Skarm.sendMessageDelay(channel, `Error in header formatting.  \nExpected: \`${expectedHeader}\`\nFound:\`${lines[0]}\``);
                        return;
                    }

                    let newUserData = Skarm.parseCSV(body);

                    //client acquire all guild members
                    let guildMembers = e.message.guild.members;

                    //compare names and set EXP values
                    for(let member of guildMembers){
                        for(let newUserDatum of newUserData){
                            if(member.username === newUserDatum.username){
                                if(!(member.id in guildData.expTable)){
                                    Skarm.spam(`Failed to find user ${member.username} ID: ${member.id} in the guild database.`);
                                    continue;
                                }
                                Skarm.spam(`Setting user \`${member.username}\`'s EXP to \`${newUserDatum.exp}\`.  Previous EXP: ${guildData.expTable[member.id].exp}`);
                                guildData.expTable[member.id].exp = newUserDatum.exp-0;
                            }
                        }
                    }

                    //console.log(`Parsed CSV: ${JSON.stringify(newUserData)}`);
                });

            }else{
                Skarm.sendMessageDelay(channel, "Error: expected exactly 1 attached file.  Found: " + e.message.attachments.length);
            }
        },

        help(bot, e) {
            Skarm.help(this, e);
        },
}

