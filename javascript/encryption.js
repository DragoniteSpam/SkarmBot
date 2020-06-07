"use strict";
const fs = require("fs");
const crypto = require("crypto-js");

class Encrypt {
    static initialize() {
        Encrypt.dataToken = fs.readFileSync("..\\aes.txt").toString();
    }
    
    static read(filename, callback) {
        fs.readFile(filename, function(err, data) {
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