"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = void 0;
const Table_1 = require("./Table");
const Transformation_1 = require("./Transformation");
class DataSource {
    constructor(tables) {
        this.relTransformations = new Transformation_1.RelationalTransform();
        this.sources = new Map();
        for (let t of tables.tableDataStructures) {
            this.addTable(new Table_1.Table(t.name, t.columns));
        }
        this.transformations = new Map();
        for (let t of tables.transformations) {
            this.transformations.set(t.name, t);
        }
    }
    addTable(table) {
        this.sources.set(table.name, table);
        return table.name;
    }
    getTable(name) {
        return this.sources.get(name);
    }
    doAllTransformations() {
        let result_table = "none";
        for (let t of this.transformations.keys()) {
            result_table = this.relTransformations.doTransformation(this, this.transformations.get(t));
        }
        return result_table;
    }
    doScriptedTransformnations() {
        let result_table = "none";
        return result_table;
    }
}
exports.DataSource = DataSource;
//# sourceMappingURL=DataSource.js.map