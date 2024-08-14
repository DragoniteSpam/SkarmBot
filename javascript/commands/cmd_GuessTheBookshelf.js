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
        "Once guessing is finalized, the sources of the anonymous submissions can be revealed (`e@ap reveal 1`).",
        "Further note: everyone who chooses to submit images to Skarm MUST allow direct messages from other members of this server.  Because Discord says bots are not allowed to be friends with humans, locking down DM's to friends-only will prevent this feature from working.",
        "Full usage guide: https://github.com/DragoniteSpam/SkarmBot/pull/72",
    ].join("\n"),
    examples: [
        { command: "e@anonpoll", effect: "Shows the currently running anonymous polls, numbered for easy access" },
        { command: "e@anonpoll new Guess the bookshelf", effect: "Creates a new poll called `Guess the bookshelf`" },
        { command: "e@anonpoll close 1", effect: "Closes off submissions to the poll with ID 1" },
        { command: "e@anonpoll open 1", effect: "Re-opens submissions to the poll with ID 1. Polls are open by default." },
        { command: "e@anonpoll post 1", effect: "Posts the submissions sent to skarm by each user to the poll with ID 1" },
        { command: "e@anonpoll reveal 1", effect: "Reveals the authors of all of the submissions to the poll with ID 1" },
        { command: "e@anonpoll delete 1", effect: "Deletes the poll with ID 1" },
        // { command: "e@anonpoll delete all", effect: "Deletes all polls listed in `e@anonpoll`" },
        { command: "e@anonpoll rename 1 Favorite carbon arrangement", effect: "Renames the first poll to `Favorite carbon arrangement`" },
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
            if (err) {
                Skarm.sendMessageDelay(e.message.channel, `Failed to create poll: ${err}`);
            } else {
                Skarm.sendMessageDelay(e.message.channel, `Created poll: ${pollName}`);
            }
            return;
        }

        if (args.length >= 2) {
            // validate args[1] is a valid index
            let idx = Number(args[1]) - 1;
            if (!(idx in guildData.anonPoll.polls)) {
                Skarm.sendMessageDelay(e.message.channel, `Invalid identifier for the poll: ${args[1]}`);
                return;
            }

            let poll = guildData.anonPoll.polls[idx];

            // act based on sub-command options
            switch (args[0]) {
                case "close":  // { command: "e@anonpoll close 1", effect: "Closes off submissions to the first poll listed in `e@anonpoll`" },
                    poll.close();
                    Skarm.sendMessageDelay(e.message.channel, `Poll \`${poll.name}\` closed!`);
                    break;

                case "open":   // { command: "e@anonpoll open 1", effect: "Re-opens submissions to the first poll listed in `e@anonpoll`. Polls are open by default." },
                    poll.reopen();
                    Skarm.sendMessageDelay(e.message.channel, `Poll \`${poll.name}\` re-opened!`);
                    break;

                case "post":   // { command: "e@anonpoll post 1", effect: "Posts the submissions sent to skarm by each user to the first poll listed in `e@anonpoll`" },
                    poll.post(e.message.channel);
                    break;

                case "reveal": // { command: "e@anonpoll reveal 1", effect: "Reveals the authors of all of the submissions to the first poll listed in `e@anonpoll`" },
                    poll.reveal(e.message.channel);
                    break;

                case "delete": // { command: "e@anonpoll delete 1", effect: "Deletes the first poll listed in `e@anonpoll`" },
                    guildData.anonPoll.delete(idx);
                    break;

                case "rename": // { command: "e@anonpoll rename 1 Favorite carbon arrangement", effect: "Renames the first poll to `Favorite carbon arrangement`" },
                    let error = guildData.anonPoll.rename(idx, args.slice(2).join(" "));
                    if(error){
                        Skarm.sendMessageDelay(e.message.channel, error);
                    } else {
                        Skarm.sendMessageDelay(e.message.channel, "Rename successful!");
                    }
                    break;

                case "42":
                    Skarm.sendMessageDelay(e.message.channel, "*explodes*");
                    break;

                default:
                    Skarm.sendMessageDelay(e.message.channel, `Unknown command: \`${args[0]}\``);
            }
        }
    },

    help(bot, e) {
        Skarm.help(this, e);
    },
}

