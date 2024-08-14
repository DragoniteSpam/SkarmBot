"use strict";
const Skarm = require("../skarm.js");
const Constants = require("../constants.js");

class Submission {
    constructor(userId, url, submissionId = -1) {
        this.userId = userId;
        this.url = url;
        this.submissionId = submissionId;
    }
}

class Poll {
    constructor(name) {
        this.submissions = [];   // Submission[]
        this.open = true;      // whether or not the poll is open to new submissions
        this.posted = false;   // whether or not the poll submissions have already been posted
        this.revealed = false; // whether or not the poll submission authors have already been revealed
        this.name = name;   // what the poll is named
    }

    getStatus() {
        if (this.revealed) {
            return "authors revealed";
        }
        if (this.posted) {
            return "submissions posted";
        }
        if (!this.open) {
            return "submissions closed";
        }
        return "submissions open";
    }

    close() { this.open = false; }
    reopen() { this.open = true; }

    async post(channel) {
        // Posts the submissions sent to skarm by each user
        for (let submission of this.submissions) {
            await Skarm.sendMessageDelay(channel, " ", false, {
                color: Skarm.generateRGB(),
                description: " ",
                image: {
                    url: submission.url,
                },
                footer: { text: `${submission.submissionId}` }
            });
        }
        this.posted = true;
    }

    async reveal(channel) {
        // Reveals the authors of all of the submissions
        await Skarm.sendMessageDelay(channel, " ", false, {
            color: Skarm.generateRGB(),
            description: this.submissions.map(sub => `${sub.submissionId} -> <@${sub.userId}>`).join("\n"),
        });
    }

    rename(newName) {
        this.name = newName;
    }

    submit(user, url) {
        // calculate the submission ID dynamically as either:
        //  the length of the array or 
        //  the next new unique ID not yet taken (if elements have been removed and shortened the array)
        let sId = Math.max(this.submissions.length + 1, ...this.submissions.map(s => 1 + s.submissionId));
        this.submissions.push(new Submission(user.id || user, url, sId));
    }

    static reconstruct(poll) { // reloads a poll from a json serialized version of itself
        let p = new Poll(poll.name);
        p.open = poll.open;
        p.posted = poll.posted;
        p.revealed = poll.revealed;

        p.submissions = poll.submissions.map(sub => new Submission(sub.userId, sub.url, sub.submissionId));

        return p;
    }
}

class AnonymousPoll {
    constructor(self) {
        // All of the polls that are operating.  Now or historically.
        this.polls = (self && self.polls) || [];
        this.polls = this.polls.map(poll => Poll.reconstruct(poll)); // reconstruct poll class from json
    }

    validateName(pollName) {
        let alreadyExists = this.polls.filter(p => p.name === pollName).length !== 0;
        if (alreadyExists) {
            return "A poll with this name already exists";
        }

        if (pollName.length === 0) {
            return "poll name has to be more than 0 characters.";
        }
    }

    /**
     * 
     * @param {String} pollName 
     * @returns Error String || false if no error occured
     */
    create(pollName) {
        // data validation
        let error = this.validateName(pollName);
        if (error) return error;

        // entry
        try {
            this.polls.push(new Poll(pollName));
        } catch (error) {
            console.error(error);
            Skarm.spam("Encountered error when creating poll:", error);
            return `${error}`;
        }
        return false;
    }

    delete(idx) {
        // Removes that poll from the collection of active polls, 
        //  all associated data gets garbage-collected
        if (!(this.polls.length > idx)) {
            throw `Delete index ${idx} out of bounds for anonymous poll collection`;
        }

        this.polls.splice(idx, 1);
    }

    rename(idx, newName) {
        let error = this.validateName(newName);
        if (error) return error;

        this.polls[idx].rename(newName);
    }
}

module.exports = {
    AnonymousPoll
};
