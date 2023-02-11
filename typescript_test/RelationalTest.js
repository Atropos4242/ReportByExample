"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DataSource_1 = require("./DataSource");
const Data_Set_A_json_1 = __importDefault(require("./Data_Set_A.json"));
const Data_Set_B_large_json_1 = __importDefault(require("./Data_Set_B_large.json"));
const Transformation_1 = require("./Transformation");
const Table_1 = require("./Table");
let source = new DataSource_1.DataSource([
    new DataSource_1.TableDataStructure("T.Modell", [
        new Table_1.Column(0, "MODELL"),
        new Table_1.Column(1, "BEZEICHNUNG"),
    ]),
    new DataSource_1.TableDataStructure("T.Anzahl", [
        new Table_1.Column(0, "PARTNER"),
        new Table_1.Column(1, "MODELL"),
        new Table_1.Column(2, "ANZAHL"),
    ]),
    new DataSource_1.TableDataStructure("T.Result", [
        new Table_1.Column(0, "PARTNER"),
        new Table_1.Column(1, "MODELL"),
        new Table_1.Column(2, "BEZEICHUNG"),
        new Table_1.Column(3, "ANZAHL"),
    ])
]);
source.getTable("T.Modell").setData(Data_Set_A_json_1.default);
source.getTable("T.Anzahl").setData(Data_Set_B_large_json_1.default);
class Modell_Row extends Table_1.Row {
    getModell() { return this.row[0]; }
    ;
    getBezeichung() { return this.row[1]; }
    ;
}
class Anzahl_Row extends Table_1.Row {
    getPartner() { return this.row[0]; }
    ;
    getModell() { return this.row[1]; }
    ;
    getAnzahl() { return this.row[2]; }
    ;
}
source.doScriptedTransformnations([
    new Transformation_1.Join("T.Modell", "T.Anzahl", (row_A, row_B) => { return row_A.getModell() == row_B.getModell(); })
], [
    new Transformation_1.GroupColumn(0, "MODELL", "key"),
    new Transformation_1.GroupColumn(1, "BEZEICHNUNG", "key"),
    new Transformation_1.GroupColumn(4, "ANZAHL", "sum")
], [
    new Transformation_1.OrderCondition(2, "T.Anzahl:ANZAHL", "DESC")
]);
//# sourceMappingURL=RelationalTest.js.map