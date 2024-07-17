let fs = require('fs');

let everything = [];
let undoneThreads = {};

let windowSize = 50;

for (let i = 0; i < 6*windowSize; i += windowSize) {
    undoneThreads[i] = false;
    fetch(`https://workchronicles.substack.com/api/v1/archive?sort=new&search=&offset=${i}&limit=${windowSize}`, {
        "body": null,
        "method": "GET"
    }).then((response) => {
        return response.json();
    }).then((comics) => {
        if (!comics) {
            undoneThreads[i] = true;
            return;
        }
        comics
            .filter(c => c.title.includes("(comic)"))
            .map((c) => {
                let { title, slug, post_date, canonical_url, cover_image } = c;
                let smallC = { title, slug, post_date, canonical_url, cover_image };
                everything.push(smallC);
                console.log(c.post_date, c.title, c.slug);
            })
        // console.log(title, slug, post_date, canonical_url, cover_image);
        // console.log(comics[0]);
    }).then( () => {
        undoneThreads[i] = true;
    });
}

// save data
let interval = setInterval(()=>{
    // stop if not done yet
    for(let i in undoneThreads){
        if(!undoneThreads[i]) return;
    }

    // sort the data
    console.log("Sorting data");
    everything = everything.sort((a,b) => {return (new Date(b.post_date)).getTime() - (new Date(a.post_date)).getTime()});
    
    // save all the data
    console.log("Saving data");
    fs.writeFileSync("./work_chronicles.json", JSON.stringify(everything));

    // clean up
    clearInterval(interval);
}, 10);
