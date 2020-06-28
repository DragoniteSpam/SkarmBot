"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Discordie = require("discordie");

const userdb = "data\\users.penguin";
const SUMMON_COOLDOWN = 60000;

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
    
    user.listSummons = function() {
        let terms = [];
        for (let term in this.summons) {
            terms.push(term);
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
                "> (summon keyword: " + term + ")"
            );
        });
    };
    
    user.memberOf = function(guild) {
        return !!User.client.Users.get(this.id).memberOf(User.client.Guilds.get(guild.id));
    };
}

class User {
    constructor(id) {
        this.id = id;
        
        this.summons = {};
        this.summonsLastTime = null;
        
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
        return User.users[id] ? User.users[id] : new User(id);
    }
    
    static getData(id) {
        return User.client.Users.get(id);
    }
    
    static load() {
        Encrypt.read(userdb, function(data, filename) {
            User.users = JSON.parse(data);
            for (let u in User.users) {
                linkFunctions(User.users[u]);
            }
        });
    }
    
    static save() {
        Encrypt.write(userdb, JSON.stringify(User.users));
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