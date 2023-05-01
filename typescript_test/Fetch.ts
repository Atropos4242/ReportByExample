//let url = "http://ws-martin2:8080/api/generic/fetchData?plain=false&function=SALES.F_FOD_FZG_LISTE&ebene=GESAMT&region=-999&gebiet=-999&kette=-999&partner=-999&orgaId=V-GLV&filter=%5B%7B%22type%22%3A%22number%22%2C%22value%22%3A%222022%22%7D%5D";
let settings = { method: "Get" };

export function fetchFromURL( url : string) : any {
    const start = performance.now();
    fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            // do something with JSON        
            //source.getTable("T.Test").setDataNotPlain(json);
            //console.log(source.getTable("T.Test").toText());
            console.log(eval("end - start"));
            return json;
        })
        .catch(function(error) {
            console.log(error);
        });
};

export function fetchFromURLs( urls : string[]) : any {
    const start = performance.now();

    // Maps each URL into a fetch() Promise
    var requests = urls.map(function(url){
        return fetch(url)
        .then(function(response) {
            // throw "uh oh!";  - test a failure
            return response.json();
        })  
    });
  
    // Resolve all the promises
    Promise.all(requests)
    .then((results) => {
        console.log(JSON.stringify(results, null, 2));
    }).catch(function(err) {
        console.log("returns just the 1st failure ...");
        console.log(err);
    })
};