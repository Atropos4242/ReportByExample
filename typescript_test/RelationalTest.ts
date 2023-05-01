import { Dataset } from './Dataset';
import { DataSource, TableDataStructures } from './DataSource';

import tableDataStructure from './TableDataStructures.json';
import dataA from './Data_Set_A.json';
import dataB from './Data_Set_B_large.json';
import { fetchFromURL, fetchFromURLs } from './Fetch';

let urls : string[] = [
    "http://ws-martin2:8080/api/generic/fetchData?plain=false&function=SALES.F_FOD_FZG_LISTE&ebene=GESAMT&region=-999&gebiet=-999&kette=-999&partner=-999&orgaId=V-GLV&filter=%5B%7B%22type%22%3A%22number%22%2C%22value%22%3A%222022%22%7D%5D"];

let source : DataSource;

function gatherLocalData() {
    const start = performance.now();

    source.getTable("T.Modell").setData(dataA as Dataset);
    console.log(source.getTable("T.Modell").toText());

    source.getTable("T.Anzahl").setData(dataB as Dataset);
    //console.log(source.getTable("T.Anzahl").toText());

    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}

function gatherRemoteData(urls : string[], callback : Function) : any {
    let start = performance.now();

    var requests = urls.map(function(url){
        return fetch(url)
        .then(function(response) {
            return response.json();
        })
    });

    // Resolve all the promises
    Promise.all(requests)
    .then((results) => {
        let end = performance.now();
        console.log("Received " + results.length + ` Datasets after ${end - start} ms`);
        for( let i = 0; i < results.length ; i++ ){
            console.log("Result " + i + ": " + results[i].length);
        }
        start = performance.now();
        source.getTable("T.FOD_UMSATZ").setDataNotPlain(results[0]);
        console.log(source.getTable("T.FOD_UMSATZ").definitionToText());
        //source.getTable("T.Test2").setDataNotPlain(results[1]);
        end = performance.now();
        console.log("Created remote Datasets " + `after ${end - start} ms`);
        //console.log(JSON.stringify(results, null, 2));
        callback();
    }).catch(function(err) {
        console.log("returns just the 1st failure ...");
        console.log(err);
    })
}

function runScript() {
    const start = performance.now();

    source = new DataSource(tableDataStructure as TableDataStructures);

    source.getTable("T.Modell").setData(dataA as Dataset);
    //console.log(source.getTable("T.Modell").toText());

    source.getTable("T.Anzahl").setData(dataB as Dataset);
    //console.log(source.getTable("T.Anzahl").toText());

    let data = fetchFromURLs(urls);
    console.log(data);

    //source.getTable("T.Test").setDataNotPlain(data);
    //console.log(source.getTable("T.Test").toText());

    console.log(source.getTable(source.doAllTransformations()).toText());

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
}

function runJSVersion() {
    const start = performance.now();
    source = new DataSource(tableDataStructure as TableDataStructures);

    source.getTable("T.Modell").setData(dataA as Dataset);
    source.getTable("T.Anzahl").setData(dataB as Dataset);

    console.log(source.getTable(source.doScriptedTransformnations()).toText());

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
}

function runTransformations() {
    const start = performance.now();

    console.log(source.getTable(source.doAllTransformations()).toText());

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
}

source = new DataSource(tableDataStructure as TableDataStructures);
gatherLocalData();
gatherRemoteData(urls, runTransformations);

