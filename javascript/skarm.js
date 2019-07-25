"use strict";
const fs = require("fs");

// Static methods. Static methods everywhere.
class Skarm {
    static log(message) {
        console.log(message);
    }
    
    static todo() {
        throw "not yet implemented";
    }
}

module.exports = Skarm;