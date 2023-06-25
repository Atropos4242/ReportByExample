import { fetchFromURL, fetchFromURLs } from './Fetch';
import { Dataset } from './Dataset';
import { DataSource, TableDataStructures } from './DataSource';

import tableDataStructure from '../data_config/gw_absatz_tab.tds.json';
import data_GW_ABSATZ_TAB from '../data_config/Data_Set_Tree_GW_ABSATZ_TAB.json';

let source : DataSource;

function gatherLocalData() {
    const start = performance.now();

    source.getTable("T.GW_ABSATZ_TAB").setDataNotPlain(data_GW_ABSATZ_TAB);
    //console.log(source.getTable("TT.GW_ABSATZ_TAB").toText());

    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}

source = new DataSource(tableDataStructure as TableDataStructures);
console.log(source.getTable("T.GW_ABSATZ_TAB").definitionToText());
source.gatherAllDataAndRunTransformations(gatherLocalData);

console.log(source.getTable("T.GW_ABSATZ_TAB").toText());