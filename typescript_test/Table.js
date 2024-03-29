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
    constructor(name, columns, url) {
        this.name = name;
        this.rows = new Array();
        this.columns = columns;
        this.url = url;
        this.colNameNumberCache = new Map;
        this.metaDataCache = new TableMetaData_1.TableMetaData();
        this.markLine = new Map;
        for (let c = 0; c < columns.length; c++) {
            if (columns[c].columnMetaData != undefined) {
                for (let m = 0; m < columns[c].columnMetaData.length; m++) {
                    this.metaDataCache.addColMetaData(c, columns[c].columnMetaData[m]);
                }
            }
        }
    }
    getMetaData() {
        return this.metaDataCache;
    }
    getColNumberByName(name) {
        if (this.colNameNumberCache.get(name) != undefined)
            return this.colNameNumberCache.get(name);
        //console.log( "No cache hit getColNumberByName: " + name + " in " + this.name);
        if (name == undefined)
            throw Error("Colummn " + name + " not found in " + this.name);
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].name.toLocaleLowerCase() == name.toLowerCase()) {
                this.colNameNumberCache.set(name, i);
                return i;
            }
        }
        this.colNameNumberCache.set(name, -1);
        throw Error("Colummn " + name + " not found in " + this.name);
        return -1;
    }
    addMarkedLine(line, marker) {
        this.markLine.set(marker, line);
        line.marked = marker;
        this.rows.push(line);
    }
    getMarkedLine(marker) {
        return this.markLine.get(marker);
    }
    getMarkedLinesMarker() {
        return this.markLine.keys();
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
        for (let row_inx = 0; row_inx < data.length; row_inx++) {
            //console.log(row);            
            let r = new Row();
            for (const key of Object.keys(data[row_inx])) {
                if (key != "__META_DATA") {
                    r.row[this.getColNumberByName(key)] = data[row_inx][key];
                }
                else {
                    //r.rowMetaData = row[key] as TableMetaDataType;
                    let md = data[row_inx][key];
                    for (let m = 0; m < md.length; m++) {
                        let tmd = Object.assign({}, md[m]);
                        this.metaDataCache.addRowMetaData(row_inx, tmd);
                    }
                }
            }
            this.rows.push(r);
        }
        return this;
    }
    padText(col_pad, str2pad) {
        return (col_pad + str2pad).slice(-(col_pad.length));
    }
    toText(excludeMetaData) {
        let col_width = [];
        let col_pad = [];
        for (let r = 0; r < this.rows.length; r++) {
            for (let c = 0; c < this.columns.length; c++) {
                if (col_width[c] == undefined)
                    col_width[c] = this.columns[c].name.length;
                if (col_width[c] < (this.rows[r].row[c] + "").length)
                    col_width[c] = (this.rows[r].row[c] + "").length;
            }
        }
        //console.log( col_width );
        for (let i = 0; i < col_width.length; i++) {
            col_pad[i] = "";
            for (let a = 0; a < col_width[i]; a++) {
                col_pad[i] += " ";
            }
        }
        let text;
        text = this.name + ':\n';
        for (let c = 0; c < this.columns.length; c++) {
            text += this.padText(col_pad[c], this.columns[c].name) + ' ';
        }
        text += '\n';
        if (this.rows.length > 0) {
            for (let inx = 0; inx < this.rows.length && inx < 100; inx++) {
                let row = this.rows[inx];
                for (let v = 0; v < row.row.length; v++) {
                    text += this.padText(col_pad[v], row.row[v]) + ' ';
                }
                if (!excludeMetaData) {
                    text += row.marked != undefined ? " | " + row.marked : "";
                    text += this.getMetaData().getAllRowMetaData(inx) != undefined ? " | " + JSON.stringify(this.getMetaData().getAllRowMetaData(inx)) : "";
                }
                text += '\n';
            }
            text += 'count=' + this.rows.length + '\n';
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