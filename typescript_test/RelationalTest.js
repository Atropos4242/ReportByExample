"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataSource_1 = require("./DataSource");
const gw_absatz_tab_tds_json_1 = __importDefault(require("../data_config/gw_absatz_tab.tds.json"));
const Data_Set_Tree_GW_ABSATZ_TAB_json_1 = __importDefault(require("../data_config/Data_Set_Tree_GW_ABSATZ_TAB.json"));
const TableDataStructures_1 = require("./TableDataStructures");
let source;
function gatherLocalData() {
    const start = performance.now();
    source.getTable("T.GW_ABSATZ_TAB").setDataNotPlain(Data_Set_Tree_GW_ABSATZ_TAB_json_1.default);
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
    let final_result = "T.GW_ABSATZ_TAB_FINAL";
    if (source.getTable(final_result) != undefined)
        console.log(source.getTable(final_result).toText(true));
    else
        console.log("No result table [" + final_result + "] returned");
}
function afterEveryTrans(tablename) {
    if (source.getTable(tablename) != undefined) {
        console.log("Target-Table " + tablename + ` [${source.getTable(tablename).rows.length}]`);
        console.log(source.getTable(tablename).toText(false));
    }
    else
        console.log("No result table [" + tablename + "] returned");
    const end = performance.now();
    console.log("Current Time " + `${end} ms`);
}
(0, TableDataStructures_1.validateTableDataStructureForm)(gw_absatz_tab_tds_json_1.default);
source = new DataSource_1.DataSource(gw_absatz_tab_tds_json_1.default);
source.gatherAllDataAndRunTransformations(gatherLocalData, beforeTrans, afterTrans, afterEveryTrans);
//# sourceMappingURL=RelationalTest.js.map