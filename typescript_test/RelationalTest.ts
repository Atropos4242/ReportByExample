import { fetchFromURL, fetchFromURLs } from './Fetch';
import { Dataset } from './Dataset';
import { DataSource } from './DataSource';
import { TableDataStructures } from './TableDataStructures';

import tableDataStructure from '../data_config/gw_absatz_tab.tds.json';
import tableDataStructure_copy from '../data_config/gw_absatz_tab.tds copy.json';

import data_GW_ABSATZ_TAB from '../data_config/Data_Set_Tree_GW_ABSATZ_TAB.json';
import { z } from "zod"

//import { TableDataStructureForm } from './JsonValidation';

let source : DataSource;

function gatherLocalData() {
    const start = performance.now();

    source.getTable("T.GW_ABSATZ_TAB").setDataNotPlain(data_GW_ABSATZ_TAB);
    //console.log(source.getTable("TT.GW_ABSATZ_TAB").toText());

    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}

const TableDataStructureForm = z.object({
    tableDataStructures: z.array( 
        z.object( {
            name: z.string(),
            columns : z.array(
                z.object({ 
                    col_nr: z.number(), 
                    name: z.string(), 
                    columnMetaData: z.object({
                        TREECON: z.object({ 
                            AGG_COL: z.string(), 
                            COL_FLT: z.array(
                                z.object({ 
                                    FLT_COL: z.string(), 
                                    FLT_VALUE: z.string() 
                                }).strict()
                            )
                        }).strict()
                    }).strict().optional()
                }).strict()
            ),
            url: z.string().optional()
        }).strict()
    )
  }).strict();

TableDataStructureForm.parse(tableDataStructure_copy);

//source = new DataSource(tableDataStructure as TableDataStructures);
//console.log(source.getTable("T.GW_ABSATZ_TAB").definitionToText());
//source.gatherAllDataAndRunTransformations(gatherLocalData);

//console.log(source.getTable("T.GW_ABSATZ_TAB").toText());