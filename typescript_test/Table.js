"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = exports.Row = void 0;
const TableMetaData_1 = require("./TableMetaData");
class Row {
    constructor() {
        this.row = new Array();
    }
}
exports.Row = Row;
class Table {
    //meta_data : Array<TableMetaData>;
    constructor(name, columns, url) {
        this.name = name;
        this.rows = new Array();
        this.columns = columns;
        this.url = url;
        //this.meta_data = new Array<TableMetaData>();
    }
    getRowMetaData(index) {
        return this.rows[index].rowMetaData;
    }
    setRowMetaData(index, md) {
        this.rows[index].rowMetaData = md;
    }
    getColMetaData(index) {
        return this.columns[index].columnMetaData;
    }
    setColMetaData(index, md) {
        this.columns[index].columnMetaData = md;
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
    setDataNotPlain(data) {
        //console.log(data.length);
        this.rows = new Array();
        //this.meta_data = new Array<TableMetaData>();
        for (let row of data) {
            //console.log(row);            
            let r = new Row();
            let m;
            for (const key of Object.keys(row)) {
                if (key != "__META_DATA")
                    r.row.push(row[key]);
                else {
                    r.rowMetaData = new TableMetaData_1.TableMetaData(row[key]);
                }
            }
            this.rows.push(r);
            //this.meta_data.push(m);
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
            for (let inx = 0; inx < this.rows.length; inx++) {
                let row = this.rows[inx];
                for (let value of row.row) {
                    text += value + '\t';
                }
                text += this.getRowMetaData[inx] != undefined ? " | " + (this.getRowMetaData[inx]).toText() : "";
                text += '\n';
            }
        }
        else {
            text += '(no data)';
        }
        text += '\n';
        return text;
    }
    definitionToText() {
        let text;
        text = this.name + ':\n';
        let max_col_len = 0;
        for (let col of this.columns) {
            if (col.name.length > max_col_len) {
                max_col_len = col.name.length;
            }
        }
        let col_name_max_width = "                                                             ";
        text += ("Index " + col_name_max_width).substring(0, 5 + 3);
        text += ("Column " + col_name_max_width).substring(0, max_col_len + 3);
        text += "MetaData";
        text += "\n";
        for (let i = 0; i < this.columns.length; i++) {
            text += (i + col_name_max_width).substring(0, 5 + 3);
            text += (this.columns[i].name + col_name_max_width).substring(0, max_col_len + 3);
            if (this.rows.length > 0)
                text += this.rows[0].row[i];
            text += (this.columns[i].columnMetaData != undefined ? JSON.stringify(this.columns[i].columnMetaData) : "");
            text += "\n";
        }
        text += '\n';
        if (this.rows.length == 0) {
            text += '(no data)';
        }
        text += '\n';
        return text;
    }
}
exports.Table = Table;
//# sourceMappingURL=Table.js.map