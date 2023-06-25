"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableMetaDataBlowup = exports.TableMetaDataTreeCon = exports.TableMetaData = void 0;
class TableMetaData {
    constructor(md) {
        this.blowup = new TableMetaDataBlowup();
        this.treeCon = new TableMetaDataTreeCon();
        if (md.BLOWUP_COLUMN != undefined)
            this.blowup.BLOWUP_COLUMN = md.BLOWUP_COLUMN;
        if (md.BLOWUP_TARGET_COLUMN != undefined)
            this.blowup.BLOWUP_TARGET_COLUMN = md.BLOWUP_TARGET_COLUMN;
    }
    toText() {
        return "META_DATA=" + JSON.stringify(this);
    }
}
exports.TableMetaData = TableMetaData;
class TableMetaDataTreeCon {
}
exports.TableMetaDataTreeCon = TableMetaDataTreeCon;
class TableMetaDataBlowup {
    setBlowupColumns(basis_col, dim_col) {
        this.BLOWUP_basis_col = basis_col;
        this.BLOWUP_dim_col = dim_col;
    }
}
exports.TableMetaDataBlowup = TableMetaDataBlowup;
//# sourceMappingURL=TableMetaData.js.map