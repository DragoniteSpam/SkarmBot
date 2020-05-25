"use strict";

const EncryptTest = require("./tests/encryptTests.js");




var err=0;
err+=Math.abs(EncryptTest.execute("spaghetti"));

if(err==0)
	console.log("All tests passed");