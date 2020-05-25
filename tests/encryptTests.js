"use strict";
const fs = require("fs");
const crypto = require("crypto-js");


class EncryptTest {
    static initialize() {
        EncryptTest.dataToken = fs.readFileSync("..\\aes.txt").toString();
    }
    
    static read(filename, callback) {
        fs.readFile(filename, function(err, data) {
            if (err) return Skarm.logError(err);
            callback(
                crypto.AES.decrypt(data, EncryptTest.dataToken).toString(),
                filename
            );
        });
    }
    
    static write(filename, data) {
        fs.writeFile(filename,
            crypto.AES.encrypt(data, EncryptTest.dataToken).toString(),
            function(err) {
                if (err) return Skarm.logError(err);
            }
        );
    }
    
    static append(filename, data) {
        EncryptTest.read(filename, function(existing, filename) {
            EncryptTest.write(filename, existing + data);
        });
    }
	static execute(string){
		EncryptTest.initialize();
		
		var i1= crypto.AES.encrypt(string,EncryptTest.dataToken,formatObj);
		var o1= crypto.AES.decrypt(i1,EncryptTest.dataToken,formatObj);
		if(string!=o1){
			console.log("output from basic encrypt with no fs use failed:\t"+string+"\t"+o1);
			return -1;
		}
		
		
		
		var filename="testEnc.test";
		//write string and verify it is what is returned
		fs.writeFileSync(filename,crypto.AES.encrypt(string, EncryptTest.dataToken).toString());
		var red =fs.readFileSync(filename);
		var output=crypto.AES.decrypt(red,EncryptTest.dataToken);
		if(string !=output){
			console.log("failed to write encrypted "+string+" to "+filename+" . Output came out as: "+output+"__EOF");
			return -1;
		}
	}
}






var JsonFormatter = {
  stringify: function(cipherParams) {
    // create json object with ciphertext
    var jsonObj = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };
​
    // optionally add iv or salt
    if (cipherParams.iv) {
      jsonObj.iv = cipherParams.iv.toString();
    }
​
    if (cipherParams.salt) {
      jsonObj.s = cipherParams.salt.toString();
    }
​
    // stringify json object
    return JSON.stringify(jsonObj);
  },
  parse: function(jsonStr) {
    // parse json string
    var jsonObj = JSON.parse(jsonStr);
​
    // extract ciphertext from json object, and create cipher params object
    var cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
    });
​
    // optionally extract iv or salt
​
    if (jsonObj.iv) {
      cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
    }
​
    if (jsonObj.s) {
      cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
    }
​
    return cipherParams;
  }
};

const formatObj={format:JsonFormatter};


module.exports = EncryptTest;