"use strict";
const fs = require("fs");
const crypto = require("crypto-js");

class EncryptTest {
    static initialize() {
        Encrypt.dataToken = fs.readFileSync("..\\aes.txt").toString();
    }
    
    static read(filename, callback) {
        fs.readFile(filename, function(err, data) {
            if (err) return Skarm.logError(err);
            callback(
                crypto.AES.decrypt(data, Encrypt.dataToken).toString(crypto.enc.Utf8),
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

	static execute(string){
		var filename="testEnc.test";
		//write string and verify it is what is returned
		fs.writeFileSync(filename,crypto.AES.encrypt(data, Encrypt.dataToken).toString());
		var red =fs.readFileSync(filename);
		if(string !=crypto.AES.decrypt(red,Encrypt.dataToken)){
			console.log("failed to write encrypted "+string+" to "+filename);
			return -1;
		}
	}
}

module.exports = Encrypt;