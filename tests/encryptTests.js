"use strict";
const fs = require("fs");
const crypto = require("crypto-js");
const Encrypt= require("..\\javascript\\encryption.js");

class EncryptTest {
	static execute(string){
		Encrypt.initialize();
		
		//verify crypto.AES encrypt/decrypt without fs use
		var i1= crypto.AES.encrypt(string,Encrypt.dataToken).toString();
		var o1= crypto.AES.decrypt(i1,Encrypt.dataToken);
		var f1= o1.toString(crypto.enc.Utf8);
		if(string!=f1){
			console.log("output from basic encrypt with no fs use failed:\t"+string+"\t"+o1);
			return -1;
		}
		
		//verify crypto.AES encrypt.decrypt with fs use
		const filename="testEnc.test";
		var enc2=crypto.AES.encrypt(string, Encrypt.dataToken).toString();
		fs.writeFileSync(filename,enc2);
		var red =fs.readFileSync(filename).toString();
		if(red!=enc2){
			console.log("failed to read/write Synced");
			return -1;
		}
		var out2=crypto.AES.decrypt(red,Encrypt.dataToken);
		var output= out2.toString(crypto.enc.Utf8);
		if(string !=output){
			console.log("failed to write encrypted "+string+" to "+filename+" . Output came out as: "+output+"__EOF");
			return -1;
		}
		
		//verify Encrypt.append which uses fs and enrypt/decrypt internally
		const app="     asdf CGP Grep | ls";
		Encrypt.append(filename,app);
		setTimeout(() => {Encrypt.read(filename,function(data,fn){
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
