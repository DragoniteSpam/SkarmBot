"use strict";

const EncryptTest = require("./tests/encryptTests.js");
//each test should be given time ms to complete, half of which is timeout time between it and the next test
const time=100;


function test(n){err+=Math.abs(n);}


var err=0;//count of errors
var n=0;//count of tests


/**Encryption Tests*/
setTimeout(() => { 
	test(EncryptTest.execute("the cold rain and snow"));
}, time*n++);
setTimeout(() => { 
	test(EncryptTest.execute("there were two blackbirds UP A TREE; hauling up the Aris liiine."+
	" {}{}{{}{}{}{}{}{}{})()()()({{}}(}{)(}{)(}{)({}()}{)(}{)(}{)(}{)({})(}{)(}{)(}{)(}{)(}{)(}{)({})(?><NIOUASPOI~~~```+"+
	"+poijasdfAT THE LINE  \n Says the other one what do I see at the line, at the liiiine? They slept in mud and wind and rain."+
	" Cursed the cold and cried in pain; Were cut down like these Roman treees..\\. Poor Michael's up to calvary. \n\n\t\t. My memory it does reveal"));
}, time*n++);
setTimeout(() => { 
	test(EncryptTest.execute(" "));
}, time*n++);
setTimeout(() => { 
	test(EncryptTest.execute(""));
}, time*n++);
setTimeout(() => { 
	test(EncryptTest.execute(null));
}, time*n++);


//log results once enough time has passed for all tests to complete
setTimeout(() => { 
	if(err==0)
		console.log("All tests passed");
}, time*n++);
