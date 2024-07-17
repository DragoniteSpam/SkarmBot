let fs = require('fs');

let netPath = "../skarmData/WorkChronicles.penguin";
let locPath = "./work_chronicles.json";

let jsonTxt = fs.readFileSync(locPath).toString();
let everything = JSON.parse(jsonTxt);

console.log("initial config");
everything.slice(0,5).map(a=>a.post_date).map(a => {console.log(a)});

e2 = everything.sort((a,b) => {
    let ad = (new Date(a.post_date)).getTime();
    let bd = (new Date(b.post_date)).getTime();
    let comparison = ad - bd;
    console.log("Comparing", ad, bd, "-->", comparison);
    return comparison;
});

console.log("Final config");
e2.slice(0,5).map(a=>a.post_date).map(a => {console.log(a)});

fs.writeFileSync(netPath, JSON.stringify(e2));
