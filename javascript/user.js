"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");
const Skarm = require("./skarm.js");
const Discordie = require("discordie");

const userdb = "data\\users.penguin";
const SUMMON_COOLDOWN = 60000;

class User {
    constructor(id) {
        this.id = id;
        
        this.summons = {};
        this.summonsLastTime = null;
        
        User.add(this);
    }
    
    addSummon(term) {
        if (term in this.summons) {
            return false;
        }
        this.summons[term] = true;
        return true;
    }
    
    removeSummon(term) {
        if (!(term in this.summons)) {
            return false;
        }
        delete this.summons[term];
        return true;
    }
    
    listSummons() {
        let terms = [];
        for (let term in this.summons) {
            terms.push(term);
        }
        
        return terms.sort().join(", ");
    }
    
    attemptSummon(e, term) {
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
    }
    
    static initialize(client) {
        User.users = {};
        User.client = client;
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
        });
    }
    
    static save() {
        Encrypt.write(userdb, JSON.stringify(User.users));
    }
}

module.exports = User;