"use strict";
const fs = require("fs");
const Encrypt = require("./encryption.js");

class User {
    constructor(id, userData) {
        this.id = id;
        this.userData = userData;
    }
}

module.exports = User;