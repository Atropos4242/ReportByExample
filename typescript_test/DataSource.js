"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDataStructure = exports.DataSource = void 0;
const Table_1 = require("./Table");
const Transformation_1 = require("./Transformation");
class DataSource {
    constructor(table_structures) {
        this.relTransformations = new Transformation_1.RelationalTransform();
        this.sources = new Map();
        for (let t of table_structures) {
            this.addTable(new Table_1.Table(t.name, t.columns));
        }
    }
    addTable(table) {
        this.sources.set(table.name, table);
        return table.name;
    }
    getTable(name) {
        return this.sources.get(name);
    }
    doScriptedTransformnations(joins, group, order) {
        const start = performance.now();
        let result_table = "none";
        let nr = 1;
        for (let j of joins) {
            result_table = this.relTransformations.join(this, "J" + nr, j);
        }
        result_table = this.relTransformations.group(this, "G", this.getTable(result_table), group);
        result_table = this.relTransformations.order(this, "O", this.getTable(result_table), order);
        const end = performance.now();
        console.log(`Execution time: ${end - start} ms`);
        console.log(this.getTable(result_table).toText());
        return result_table;
    }
}
exports.DataSource = DataSource;
class TableDataStructure {
    constructor(name, columns) {
        this.name = name;
        this.columns = columns;
    }
}
exports.TableDataStructure = TableDataStructure;
//# sourceMappingURL=DataSource.js.map