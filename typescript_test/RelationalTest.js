"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataSource_1 = require("./DataSource");
const gw_absatz_tab_tds_json_1 = __importDefault(require("../data_config/gw_absatz_tab.tds.json"));
const Data_Set_Tree_GW_ABSATZ_TAB_json_1 = __importDefault(require("../data_config/Data_Set_Tree_GW_ABSATZ_TAB.json"));
let source;
function gatherLocalData() {
    const start = performance.now();
    source.getTable("T.GW_ABSATZ_TAB").setDataNotPlain(Data_Set_Tree_GW_ABSATZ_TAB_json_1.default);
    //console.log(source.getTable("TT.GW_ABSATZ_TAB").toText());
    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}
source = new DataSource_1.DataSource(gw_absatz_tab_tds_json_1.default);
console.log(source.getTable("T.GW_ABSATZ_TAB").definitionToText());
source.gatherAllDataAndRunTransformations(gatherLocalData);
console.log(source.getTable("T.GW_ABSATZ_TAB").toText());
//# sourceMappingURL=RelationalTest.js.map