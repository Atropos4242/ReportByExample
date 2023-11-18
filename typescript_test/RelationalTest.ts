
import { DataSource } from './DataSource';
import tableDataStructure from '../data_config/gw_absatz_tab.tds.json';
import data_GW_ABSATZ_TAB from '../data_config/Data_Set_Tree_GW_ABSATZ_TAB.json';
import { TableDataStructureType, validateTableDataStructureForm } from './TableDataStructures';

let source : DataSource;

function gatherLocalData() {
    const start = performance.now();

    source.getTable("T.GW_ABSATZ_TAB").setDataNotPlain(data_GW_ABSATZ_TAB);
    //console.log(source.getTable("T.GW_ABSATZ_TAB").definitionToText());
    //console.log(source.getTable("T.GW_ABSATZ_TAB").toText(false));

    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}

function beforeTrans() {
    const end = performance.now();
    console.log("Current Time " + `${end} ms`);
    //console.log(source.getTable("T.ABSATZ").toText(false));
}

function afterTrans() {
    let final_result: string = "T.GW_ABSATZ_TAB_FINAL"
    if( source.getTable(final_result) != undefined )
        console.log(source.getTable(final_result).toText(true));
    else
        console.log("No result table [" + final_result+ "] returned");
}

function afterEveryTrans(tablename: string) {
    if( source.getTable(tablename) != undefined ) {
         console.log("Target-Table " + tablename + ` [${source.getTable(tablename).rows.length}]`);
         console.log(source.getTable(tablename).toText(false));
    } else
         console.log("No result table [" + tablename + "] returned");
    const end = performance.now();
    console.log("Current Time " + `${end} ms`);
}
validateTableDataStructureForm(tableDataStructure);

source = new DataSource(tableDataStructure as TableDataStructureType);
source.gatherAllDataAndRunTransformations(gatherLocalData, beforeTrans, afterTrans,afterEveryTrans);