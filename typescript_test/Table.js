"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = exports.Row = void 0;
class Row {
    constructor() {
        this.row = new Array();
    }
}
exports.Row = Row;
class Table {
    constructor(name, columns) {
        this.name = name;
        this.rows = new Array();
        this.columns = columns;
    }
    setData(data) {
        this.rows = new Array();
        for (let row of data.rows) {
            let r = new Row();
            r.row = row;
            this.rows.push(r);
        }
        return this;
    }
    toText() {
        let text;
        text = this.name + ':\n';
        for (let col of this.columns) {
            text += col.name + '\t';
        }
        text += '\n';
        if (this.rows.length > 0) {
            for (let row of this.rows) {
                for (let value of row.row) {
                    text += value + '\t';
                }
                text += '\n';
            }
        }
        else {
            text += '(no data)';
        }
        text += '\n';
        return text;
    }
    ;
}
exports.Table = Table;
//# sourceMappingURL=Table.js.map