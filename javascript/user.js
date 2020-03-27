"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");

class User {
    constructor(id, userData) {
        this.id = id;
        this.userData = userData;
        
        this.summons = {};
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
}

module.exports = User;