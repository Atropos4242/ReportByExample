
import { DataSource } from './DataSource';
import tableDataStructure from '../data_config/gw_absatz_tab.tds.json';
import data_GW_ABSATZ_TAB from '../data_config/Data_Set_Tree_GW_ABSATZ_TAB.json';
import { TableDataStructureType, validateTableDataStructureForm } from './TableDataStructures';

let source : DataSource;

function gatherLocalData() {
    const start = performance.now();

    source.getTable("T.GW_ABSATZ_TAB").setDataNotPlain(data_GW_ABSATZ_TAB);
    console.log(source.getTable("T.GW_ABSATZ_TAB").definitionToText());
    console.log(source.getTable("T.GW_ABSATZ_TAB").toText(false));

    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}

function beforeTrans() {
    console.log(source.getTable("T.ABSATZ").toText(false));
}

function afterTrans() {
    if( source.getTable("T.GW_ABSATZ_TAB_3") != undefined )
        console.log(source.getTable("T.GW_ABSATZ_TAB_3").toText(true));
    else
        console.log("No result table [T.GW_ABSATZ_TAB_3] returned");
}

validateTableDataStructureForm(tableDataStructure);

source = new DataSource(tableDataStructure as TableDataStructureType);
source.gatherAllDataAndRunTransformations(gatherLocalData, beforeTrans, afterTrans);