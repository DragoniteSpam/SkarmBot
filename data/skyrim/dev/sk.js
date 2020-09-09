const fs=require("fs");

const DATA={
    // output style
    filtered: 0,
    sorted: 1,
};

var style=DATA.filtered;
var lineLimit=0;

// process.argv[0] => nodejs install path
// process.argv[1] => this file
// arguments: /filtered, /sorted,/lines={n}
for (var i=2; i<process.argv.length; i++){
    var arg=process.argv[i];
    
    if (arg==="/filtered"){
        style=DATA.filtered;
    } else if (arg==="/sorted"){
        style=DATA.sorted;
    } else if (arg.startsWith("/lines=")){
        try {
            lineLimit=parseInt(arg.replace("/lines=", ""));
        } catch (error){
            console.log("error in /lines={n}, somehow");
        }
    } else {
        console.log("don't know what this argument means: "+arg);
    }
}

if (style==DATA.filtered){
    processFiltered();
} else {
    processSorted();
}

function processFiltered(){
    fs.readFile("dialogue.skyrim", function(err, data){
        if(err){
            console.log("Something blew up. Oh noes!");
            throw err;
        }
        
        var actual={};
        var map={};
        
        var lines=readData(data);
        
        for (var i=0; i<lines.length; i++){
            var linedata=lines[i];
            // 0: form id
            // 1: quest
            // 2, 3, ...: identifier of some sort
            // 3+n: index, probably?
            // 4+n: text
            // 5+n: tone
            
            if (linedata.length>4){
                var words=lineText(linedata).trim();
                
                if (words.length>0){
                    var questName=lineQuestName(linedata);
                    if (actual[questName]===undefined){
                        actual[questName]=[];
                    }
                    if (map[words]===undefined){
                        map[words]=true;
                        actual[questName].push(words);
                    }
                }
            }
        }
        
        var n=0;
        var fc=0;
            
        var output=[""];
        for (var questName in actual){
            var quest=actual[questName];
            if (quest.length>0){
                for (var i=0; i<quest.length; i++){
                    output[fc]=output[fc]+quest[i]+"\r\n";
                    if (lineLimit>0){
                        if (++n>=lineLimit){
                            n=0;
                            output.push("");
                            fc++;
                        }
                    }
                }
            }
        }
        
        for (var i=0; i<output.length; i++){
            fs.writeFile("./output"+i+".skyrim", output[i], function(err) {
                if(err) {
                    console.log("Something blew up. Oh noes!");
                    throw err;
                }
            });
        }
    });
}

function processSorted(){
    fs.readFile("dialogue.skyrim", function(err, data){
        if(err){
            console.log("Something blew up. Oh noes!");
            throw err;
        }
        
        var lines=readData(data);
        
        var sorted=[];
        var map={};
        
        for (var i=0; i<lines.length; i++){
            var linedata=lines[i];
            // 0: form id
            // 1: quest
            // 2: identifier of some sort
            // 3: index, probably?
            // 4: text
            
            if (linedata.length>4){
                var words=lineText(linedata).trim();
                if (words.length>0&&map[words]===undefined){
                    map[words]=true;
                    sorted.push(linedata);
                }
            }
        }
        
        sorted.sort(function(a, b){
            var lta=lineText(a);
            var ltb=lineText(b);
            if (lta.length==ltb.length){
                return lta.localeCompare(ltb);
            }
            return lta.length-ltb.length;
        });
        
        // dont feel like splitting up the sorted lists into multiple files so ehhhh
        
        var output="";
        var debugoutput="";
        for (var i=0; i<sorted.length; i++){
            for (var j=0; j<sorted[i].length; j++){
                output=output+sorted[i][j]+"\t";
            }
            output=output.trim()+"\r\n";
            debugoutput=debugoutput+lineText(sorted[i])+"\r\n";
        }
        
        fs.writeFile("./sorted.skyrim", output, function(err) {
            if(err) {
                console.log("Something blew up. Oh noes!");
                throw err;
            }
        });
        
        fs.writeFile("./sorted-debug.skyrim", debugoutput, function(err) {
            if(err) {
                console.log("Something blew up. Oh noes!");
                throw err;
            }
        });
    });
}

function indexOfIdentifier(line){
    for (var i=2; i<line.length; i++){
        if (line[i].toUpperCase()==line[i]&&line[i].length==4){
            return i;
        }
    }
    
    return -1;
}

function lineQuestName(line){
    var name="";
    var iod=indexOfIdentifier(line);
    for (var i=1; i<iod; i++){
        name=name+line[i];
        if (i+1<iod){
            name=name+".";
        }
    }
    
    return name;
}

function lineText(line){
    var iod=indexOfIdentifier(line);
    if (iod>-1&&line.length>=iod+3){
        return line[iod+2];
    }
    
    return "";
}

function readData(data){
    var lines=data.toString().split('\n');
    
    var values=[];
    for (var i=0; i<lines.length; i++){
        values.push(lines[i].trim().split("\t").filter(function(thing){
            return thing.trim().length>0;
        }));
    }
    
    return values;
}