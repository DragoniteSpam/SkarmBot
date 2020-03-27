"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");

const userdb = "..\\data\\users.penguin";

class User {
    static users = {};
    
    constructor(id, userData) {
        this.id = id;
        this.userData = userData;
        
        this.summons = {};
        
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
    
    static add(user) {
        if (user in User.users) {
            return false;
        }
        User.users[user.id] = user;
        return true;
    }
    
    static remove(user) {
        if (!(user in User.users) {
            return false;
        }
        delete User.users[user.id];
        return true;
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