"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataSource_1 = require("./DataSource");
const TableDataStructures_json_1 = __importDefault(require("./TableDataStructures.json"));
const Data_Set_A_json_1 = __importDefault(require("./Data_Set_A.json"));
const Data_Set_B_large_json_1 = __importDefault(require("./Data_Set_B_large.json"));
let source;
function gatherLocalData() {
    const start = performance.now();
    source.getTable("T.Modell").setData(Data_Set_A_json_1.default);
    //console.log(source.getTable("T.Modell").toText());
    source.getTable("T.Anzahl").setData(Data_Set_B_large_json_1.default);
    //console.log(source.getTable("T.Anzahl").toText());
    const end = performance.now();
    console.log("Created local Datasets after " + `${end - start} ms`);
}
source = new DataSource_1.DataSource(TableDataStructures_json_1.default);
source.gatherAllDataAndRunTransformations(gatherLocalData);
//# sourceMappingURL=RelationalTest.js.map