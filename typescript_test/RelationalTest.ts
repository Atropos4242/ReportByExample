import { Dataset } from './Dataset';
import { DataSource, TableDataStructures } from './DataSource';

import tableDataStructure from './TableDataStructures.json';
import dataA from './Data_Set_A.json';
import dataB from './Data_Set_B_large.json';
import { fetchFromURL, fetchFromURLs } from './Fetch';

let source : DataSource;

function gatherLocalData() {
    const start = performance.now();

    source.getTable("T.Modell").setData(dataA as Dataset);
    //console.log(source.getTable("T.Modell").toText());

    source.getTable("T.Anzahl").setData(dataB as Dataset);
    //console.log(source.getTable("T.Anzahl").toText());

    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}


source = new DataSource(tableDataStructure as TableDataStructures);
source.gatherAllDataAndRunTransformations(gatherLocalData);


