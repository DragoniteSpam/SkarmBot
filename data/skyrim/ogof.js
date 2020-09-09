const fs=require("fs");

let dirty = fs.readFileSync("output.skyrim").toString().split("\n");

let clear = {};

let iterations = "gunjar pelagius rogvir ulfric torygg [ ] elf ( ) die aaa eee bastard fuck shit".split(" ");


for(let i in dirty){
	let temp = dirty[i].toLowerCase();
	if(temp.length <20)
		continue;
	
	let cont=false;
	for(let i in iterations){
		if(temp.includes(iterations[i])){
			cont=true;
		}
	}
	
	if(cont)
		continue;
	if(temp.includes("i am hereby granting you permission"))
		continue; //to avoid any potential confusion 
	if(temp.includes("i'll kill you"))
		continue;
	
	
	clear[temp]=true;
}

fs.writeFileSync("outtake.skyrim",Object.keys(clear).join('\n'));