
fetch("https://workchronicles.substack.com/api/v1/archive?sort=new&search=&offset=191&limit=12", {
  "body": null,
  "method": "GET"
}).then((response) => {
    return response.json();
}).then((comics)=>{
    let {title, slug, post_date, canonical_url, cover_image} = comics[0];
    console.log(title, slug, post_date, canonical_url, cover_image);
});
