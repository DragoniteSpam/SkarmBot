"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Discordie = require("discordie");
const Constants = require("./constants");

const userdb = "../skarmData/users.penguin";
const SUMMON_COOLDOWN = 60000;

const linkVariables = function(user) {
    if (user.actionState === undefined) user.actionState = { };
}

const linkFunctions = function(user) {
    user.addSummon = function(term) {
        if (term in this.summons) {
            return false;
        }
        this.summons[term] = true;
        User.save();
        return true;
    }
    
    user.removeSummon = function(term) {
        if (!(term in this.summons)) {
            return false;
        }
        delete this.summons[term];
        User.save();
        return true;
    }
    
    user.listSummons = function(v) {
		v = v || "";
        let terms = [];
        for (let term in this.summons) {
			if(term.includes(v)){
				terms.push(term);
			}
        }
        return terms.sort().join(", ");
    }
    
    user.attemptSummon = function(e, term) {
        let userData = User.getData(this.id);
        // you must be in the same channel
        if (!userData.memberOf(e.message.channel.guild_id)) {
            return;
        }
        // you can't summon yourself
        if (e.message.author.id == this.id) {
            return;
        }
        // can't see summons in channels they can't view
        if (!userData.can(Discordie.Permissions.Text.READ_MESSAGES, e.message.channel)) {
            return;
        }
        // can't spam summons
        if (this.summonsLastTime &&
                (Date.now() - this.summonsLastTime) < SUMMON_COOLDOWN) {
            return;
        }
        // issue the summons
        this.summonsLastTime = Date.now();
        userData.openDM().then(function(dm) {
            dm.sendMessage("There was a message that we think you'll be " +
                "interested in!\n```" + e.message.content +"``` by **" +
                e.message.author.username + "** in <#" + e.message.channel_id +
                "> (summon keyword: " + term + ")\n" +
                `Direct message link: https://discord.com/channels/${e.message.guild.id}/${e.message.channel.id}/${e.message.id}`
            );
        });
    };
    
    user.memberOf = function(guild) {
		if(guild.id==null)
			return false;
		if(User.client.Guilds.get(guild.id)==null)
			return false;
        return !!User.client.Users.get(this.id).memberOf(User.client.Guilds.get(guild.id));
    };

    /**
     * assumes that e has properties as follows: e.message.member.name
     * @param e
     */
    user.getName = function (e) {
        return (user.nickName || e.message.member.name);
    };

    /**
     * Sets a user's action state in a particular channel for a fixed interval of time
     *
     * @param callback(e: Event MESSAGE_CREATE) - the handler that should run due to the user's next message
     * @param channelID
     * @param timeout seconds until state expires
     */
    user.setActionState = function (callback, channelID = Constants.Channels.SPAM.id, timeout = 60000) {
        let st = Date.now();
        user.actionState[channelID] = {
            handler: callback,
            startTime: st,
            timeout: setTimeout(() => {     // state self-destruct timeout if state isn't progressed
                if(user.actionState[channelID].startTime === st){
                    delete user.actionState[channelID];
                    Skarm.sendMessageDelay(channelID, "Timeout: received no user input.");
                }
            }, timeout * 1000)
        };
    }
}

class User {
    constructor(id) {
        this.id = id;

        this.previousName = undefined;

        this.summons = {};
        this.summonsLastTime = null;

        /**
         * A string of up to 32 characters for what skarm will refer to a user has should they choose to set it.  Does not affect log outputs.
         * @type String
         */
        this.nickName = undefined;

        /**
         * A collection of per-channel states that skarm should act off of for cross-message user interaction.
         * Keys: channel ID
         * Values: {
         *     handler: anonymous handler function (Event e: MESSAGE_CREATE) => {}
         *     timeout: self-destruct timeout if state is not acted upon within the duration given
         * }
         */
        this.actionState = { };

        User.add(this);
        
        linkFunctions(this);
    }
    
    static initialize(client) {
        User.users = {};
        User.guilds = {};
        try {
            User.load();
            User.client = client;
        } catch (e) {
            console.log("something bad happened when loading users: " + e);
        }
    }
    
    static add(user) {
        if (user in User.users) {
            return false;
        }
        User.users[user.id] = user;
        return true;
    }
    
    static remove(user) {
        if (!(user in User.users)) {
            return false;
        }
        delete User.users[user.id];
        return true;
    }
    
    static get(id) {
		if(User.users)
			return User.users[id] ? User.users[id] : new User(id);
		return null;
    }
    
    static getData(id) {
        return User.client.Users.get(id);
    }
    
    static load() {
        Encrypt.read(userdb, function(data, filename) {
            User.users = JSON.parse(data);
            for (let u in User.users) {
                linkFunctions(User.users[u]);
                linkVariables(User.users[u]);
            }
			console.log("Initialized "+Object.keys(User.users).length + " Users");
        });
    }
    
    static save() {
        Encrypt.write(userdb, JSON.stringify(User.users));
		console.log("Saved User Data");
    }
    
    static saveDebug() {
        fs.writeFile("debug/users.butt",
            JSON.stringify(User.users),
            "utf8",
            function(err) {
                if (err) console.log("something went wrong: " + err);
            }
        );
    }
}

module.exports = User;
