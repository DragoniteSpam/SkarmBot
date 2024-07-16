
fetch("https://workchronicles.substack.com/api/v1/archive?sort=new&search=&offset=1&limit=50", {
  "body": null,
  "method": "GET"
}).then((response) => {
    return response.json();
}).then((comics)=>{
    comics
        .filter(c=>c.title.includes("(comic)"))
        .map((c) => {
        console.log(c.post_date, c.title, c.slug);
    })
    // let {title, slug, post_date, canonical_url, cover_image} = comics[0];
    // console.log(title, slug, post_date, canonical_url, cover_image);
    console.log(comics[0]);
});
