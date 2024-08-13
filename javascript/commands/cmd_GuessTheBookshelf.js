"use strict";
const { os, request, Skarm, Constants, Web, Users, Guilds, Permissions, Skinner, SarGroups, ShantyCollection } = require("./_imports.js");

module.exports = {
    aliases: ["anonpoll", "ap"],
    params: [""],
    usageChar: "@",
    helpText: [
        "Sets up and manages the state of a community anonymous poll.",
        "All members of the server are able to submit images by directly messaging Skarmbot.",
        "Once the poll is closed (`e@ap close 1`), skarm can post each of the submission results (`e@ap post 1`), allowing the server members to guess on who submitted what.",
        "Once guessing is finalized, the sources of the anonymous submissions can be revealed (`e@ap reveal 1`)."
    ].join("\n"),
    examples: [
        { command: "e@anonpoll", effect: "Shows the currently running anonymous polls, numbered for easy access" },
        { command: "e@anonpoll new Guess the bookshelf", effect: "Creates a new poll called `Guess the bookshelf`" },
        { command: "e@anonpoll close 1", effect: "Closes off submissions to the poll with ID 1" },
        { command: "e@anonpoll open 1", effect: "Re-opens submissions to the poll with ID 1. Polls are open by default." },
        { command: "e@anonpoll post 1", effect: "Posts the submissions sent to skarm by each user to the poll with ID 1" },
        { command: "e@anonpoll reveal 1", effect: "Reveals the authors of all of the submissions to the poll with ID 1" },
        { command: "e@anonpoll delete 1", effect: "Deletes the poll with ID 1" },
        { command: "e@anonpoll delete all", effect: "Deletes all polls listed in `e@anonpoll`" },
    ],
    ignoreHidden: false,
    perms: Permissions.MOD,
    category: "general",

    execute(bot, e, userData, guildData) {
        let args = Skarm.commandParamTokens(e.message.content);


        // { command: "e@anonpoll", effect: "Shows the currently running anonymous polls, numbered for easy access" },
        if (args.length === 0) {
            let activePolls = guildData.anonPoll.polls.map((poll, idx) => {
                let entry = {
                    name: poll.name,
                    value: [
                        `Submissions: ${poll.submissions.length}`,
                        `ID: ${idx + 1}`,  // for non-programmers, arrays start at 1
                        `Status: ${poll.getStatus()}`,
                    ].join("\n"),
                    inline: true
                };
                return entry;
            });

            let embedobj = {
                color: Skarm.generateRGB(),
                title: `Currently active polls`,
                description: " ",
                fields: activePolls,
                timestamp: new Date(),
                // footer: {text: "Currently active polls"}
            };
            if (activePolls.length) {
                Skarm.sendMessageDelay(e.message.channel, " ", false, embedobj);
            } else {
                Skarm.sendMessageDelay(e.message.channel, "This guild does not currently have any active polls.  Create one with `e@ap new Your poll name goes here!`");
            }
            return;
        }

        // { command: "e@anonpoll new Guess the bookshelf", effect: "Creates a new poll called `Guess the bookshelf`" },
        if (args[0] === "new") {
            args.splice(0, 1); // drop the `new`
            let pollName = args.join(" ");
            let err = guildData.anonPoll.create(pollName);
            if(err){
                Skarm.sendMessageDelay(e.message.channel, `Failed to create poll: ${err}`);
            } else {
                Skarm.sendMessageDelay(e.message.channel, `Created poll: ${pollName}`);
            }
        }

        // TODO        { command: "e@anonpoll close 1", effect: "Closes off submissions to the first poll listed in `e@anonpoll`" },
        // TODO        { command: "e@anonpoll open 1", effect: "Re-opens submissions to the first poll listed in `e@anonpoll`. Polls are open by default." },
        // TODO        { command: "e@anonpoll post 1", effect: "Posts the submissions sent to skarm by each user to the first poll listed in `e@anonpoll`" },
        // TODO        { command: "e@anonpoll reveal 1", effect: "Reveals the authors of all of the submissions to the first poll listed in `e@anonpoll`" },
        // TODO        { command: "e@anonpoll delete 1", effect: "Deletes the first poll listed in `e@anonpoll`" },

    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

