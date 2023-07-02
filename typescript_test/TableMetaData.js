"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableMetaData = void 0;
class TableMetaData {
    constructor() {
        this.colMetaData = new Map;
        this.rowMetaData = new Map;
    }
    addColMetaData(col_nr, cmd) {
        if (this.colMetaData.get(col_nr) == undefined) {
            this.colMetaData.set(col_nr, new Map);
        }
        this.colMetaData.get(col_nr).set(cmd.TRANS_NAME, cmd);
    }
    addRowMetaData(col_nr, cmd) {
        if (this.rowMetaData.get(col_nr) == undefined) {
            this.rowMetaData.set(col_nr, new Map);
        }
        this.rowMetaData.get(col_nr).set(cmd.TRANS_NAME, cmd);
    }
    getColMetaData(col_nr, transName) {
        var _a;
        return (_a = this.colMetaData.get(col_nr)) === null || _a === void 0 ? void 0 : _a.get(transName);
    }
    getColBlowupMetaData(col_nr, transName) {
        if (this.getColMetaData(col_nr, transName) != undefined)
            return this.getColMetaData(col_nr, transName);
    }
    getColTreeConMetaData(col_nr, transName) {
        if (this.getColMetaData(col_nr, transName) != undefined)
            return this.getColMetaData(col_nr, transName);
    }
    getRowMetaData(row_nr, transName) {
        var _a;
        return (_a = this.rowMetaData.get(row_nr)) === null || _a === void 0 ? void 0 : _a.get(transName);
    }
    getAllRowMetaData(row_nr) {
        let result = [];
        if (this.rowMetaData.get(row_nr) != undefined) {
            for (const k of this.rowMetaData.get(row_nr).keys()) {
                result.push(this.rowMetaData.get(row_nr).get(k));
            }
        }
        return result;
    }
    getRowBlowupMetaData(row_nr, transName) {
        if (this.getRowMetaData(row_nr, transName) != undefined)
            return this.getRowMetaData(row_nr, transName);
    }
    getRowTreeConMetaData(row_nr, transName) {
        if (this.getRowMetaData(row_nr, transName) != undefined)
            return this.getRowMetaData(row_nr, transName);
    }
    toText() {
        return "META_DATA=" + JSON.stringify(this);
    }
}
exports.TableMetaData = TableMetaData;
//# sourceMappingURL=TableMetaData.js.map