"use strict";
const fs = require("fs");
const crypto = require("crypto-js");
const Skarm = require("../javascript/skarm.js");

class Encrypt {
    static initialize() {
        Encrypt.dataToken = fs.readFileSync("../aes.txt").toString();
    }
    
    static read(filename, callback) {
        console.log("Loading in encrypted file:", filename);
        fs.readFile(filename, function(err, data) {
            console.log("Loaded encrypted file:", filename);
            if (err) return Skarm.logError(err);
            callback(
                crypto.AES.decrypt(data.toString(), Encrypt.dataToken).toString(crypto.enc.Utf8),
                filename
            );
        });
    }
    
    static write(filename, data) {
        fs.writeFile(filename,
            crypto.AES.encrypt(data, Encrypt.dataToken).toString(),
            function(err) {
                if (err) return Skarm.logError(err);
            }
        );
    }
    
    static append(filename, data) {
        Encrypt.read(filename, function(existing, filename) {
            Encrypt.write(filename, existing + data);
        });
    }
}

module.exports = Encrypt;
