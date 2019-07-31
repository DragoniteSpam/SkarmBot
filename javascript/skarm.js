"use strict";
const fs = require("fs");

// Static methods. Static methods everywhere.
class Skarm {
    static log(message) {
        console.log(message);
    }
    
    static todo(message) {
        throw "not yet implemented: " + message;
    }
    
    static logError(err) {
        // you can do whatever you want i guess
    }
}

module.exports = Skarm;