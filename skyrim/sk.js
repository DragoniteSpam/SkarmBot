const fs=require("fs");

fs.readFile("dialogue.skyrim", function(err, data){
    if(err){
        console.log("Something blew up. Oh noes!");
        throw err;
    }
    var actual=[];
    var lines=data.toString().split('\n');
    for (var i=0; i<lines.length; i++){
        var data=lines[i].trim().split("\t");
        // 0: form id
        // 1: quest
        // 2: ?
        // 3: ?
        // n-1: text
        var words=data[data.length-1];
        if (words.length>5&&!actual.includes(words)){
            actual.push(words);
        }
    }
    
    var output="";
    for (var i=0; i<actual.length; i++){
        output=output+actual[i]+"\r\n";
    }
    
    fs.writeFile("output.skyrim", output, function(err) {
		if(err) {
			console.log("Something blew up. Oh noes!");
            throw err;
		}
	});
});