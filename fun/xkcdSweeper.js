const request=require("request");
const fs = require("fs");

let keys = {};
let arr = [];

const min=2001;
const max=2355;

for( let i=0;i<(max-min);i++){
	arr[i]="";
}
var threads=0;
for( let i=min;i<=max;i++){
	getter(i);
	threads++;
}

function getter(i){
	var params={
        uri: "https://xkcd.com/"+i,
        timeout: 20000,
        followAllRedirects: true
    };
	
	request.get(params, function(error, response, body){
		if (!error){
			let startTarget="<title>";
			let arguo=body.indexOf(startTarget);
			let title = body.substring(arguo+startTarget.length);
			title = title.substring(0,title.indexOf("<"));
			keys[title]=i;
			arr[i-min]=title;
			console.log(title+" "+i);
			threads--;
		}else{
			console.error(error);
		}
	});
}

let fail=false;

var realTimeout=30;
timeout();

function timeout(){
	console.log("Time left: "+realTimeout+"\tthreads left: "+threads);
	setTimeout(()=>{
		if(threads==0){
			return finale();
		}

		realTimeout--;

		if(realTimeout>0){
				timeout();
		}else {
			finale();
		}
	},1000);

}

function finale(){
	fs.writeFile("output-"+min+"-"+max+".json",JSON.stringify(keys), (err) => {
		if (err) throw err;
		console.log('The file has been saved!');
	});
	let str="";
	let emptiness=0, full=0;
	for( let i=0;i<(max-min);i++){
		if(i%8==0){
			console.log(str);
			str=(i)+"";
		}
		if(arr[i]===""){
			str+="E\t";
			emptiness++;
		}else{
			if(arr[i]) {
				str += arr[i].substring(0, 4) + "    ";
				full++;
			}else{
				i=2400;
			}
		}
	}
	console.log(arr.join("\t"));
	console.log("Empty: "+emptiness + "\tFull: "+full);
}