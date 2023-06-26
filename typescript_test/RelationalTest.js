"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gw_absatz_tab_tds_copy_json_1 = __importDefault(require("../data_config/gw_absatz_tab.tds copy.json"));
const Data_Set_Tree_GW_ABSATZ_TAB_json_1 = __importDefault(require("../data_config/Data_Set_Tree_GW_ABSATZ_TAB.json"));
const zod_1 = require("zod");
//import { TableDataStructureForm } from './JsonValidation';
let source;
function gatherLocalData() {
    const start = performance.now();
    source.getTable("T.GW_ABSATZ_TAB").setDataNotPlain(Data_Set_Tree_GW_ABSATZ_TAB_json_1.default);
    //console.log(source.getTable("TT.GW_ABSATZ_TAB").toText());
    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}
const TableDataStructureForm = zod_1.z.object({
    tableDataStructures: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        columns: zod_1.z.array(zod_1.z.object({
            col_nr: zod_1.z.number(),
            name: zod_1.z.string(),
            columnMetaData: zod_1.z.object({
                TREECON: zod_1.z.object({
                    AGG_COL: zod_1.z.string(),
                    COL_FLT: zod_1.z.array(zod_1.z.object({
                        FLT_COL: zod_1.z.string(),
                        FLT_VALUE: zod_1.z.string()
                    }).strict())
                }).strict()
            }).strict().optional()
        }).strict()),
        url: zod_1.z.string().optional()
    }).strict())
}).strict();
TableDataStructureForm.parse(gw_absatz_tab_tds_copy_json_1.default);
//source = new DataSource(tableDataStructure as TableDataStructures);
//console.log(source.getTable("T.GW_ABSATZ_TAB").definitionToText());
//source.gatherAllDataAndRunTransformations(gatherLocalData);
//console.log(source.getTable("T.GW_ABSATZ_TAB").toText());
//# sourceMappingURL=RelationalTest.js.map