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
                crypto.AES.decrypt(data.toString(), EncryptTest.dataToken).toString(crypto.enc.Utf8),
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
		
		var i1= crypto.AES.encrypt(string,EncryptTest.dataToken).toString();
		var o1= crypto.AES.decrypt(i1,EncryptTest.dataToken);
		var f1= o1.toString(crypto.enc.Utf8);
		if(string!=f1){
			console.log("output from basic encrypt with no fs use failed:\t"+string+"\t"+o1);
			return -1;
		}
		
		
		
		const filename="testEnc.test";
		//write string and verify it is what is returned
		var enc2=crypto.AES.encrypt(string, EncryptTest.dataToken).toString();
		fs.writeFileSync(filename,enc2);
		var red =fs.readFileSync(filename).toString();
		if(red!=enc2){
			console.log("failed to read/write Synced");
			return -1;
		}
		var out2=crypto.AES.decrypt(red,EncryptTest.dataToken);
		//console.log(out2); //this is something very funky
		var output= out2.toString(crypto.enc.Utf8);
		if(string !=output){
			console.log("failed to write encrypted "+string+" to "+filename+" . Output came out as: "+output+"__EOF");
			return -1;
		}
		
		const app="asdf CGP Grep";
		EncryptTest.append(filename,app);
		setTimeout(() => {EncryptTest.read(filename,function(data,fn){
			if(data!=(string+app)){
				console.log("Failed append");
				console.log("Append output:\t"+data);
				console.log("Expected output:\t"+string+app);
				return -1;
			}
		});}, 20);

		
		
		
		return 0;
	}
}


module.exports = EncryptTest;
