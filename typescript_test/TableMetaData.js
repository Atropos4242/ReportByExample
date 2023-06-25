"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableMetaData = void 0;
class TableMetaData {
    constructor(md) {
        if (md.BLOWUP_COLUMN != undefined)
            this.BLOWUP_COLUMN = md.BLOWUP_COLUMN;
        if (md.BLOWUP_TARGET_COLUMN != undefined)
            this.BLOWUP_TARGET_COLUMN = md.BLOWUP_TARGET_COLUMN;
    }
    setBlowupColumns(basis_col, dim_col) {
        this.BLOWUP_basis_col = basis_col;
        this.BLOWUP_dim_col = dim_col;
    }
    toText() {
        //return "META_DATA={ " + (this.BLOWUP != undefined ? "BLOWUP: " + this.BLOWUP +  : "") + " }";
        return "META_DATA=" + JSON.stringify(this);
    }
}
exports.TableMetaData = TableMetaData;
//# sourceMappingURL=TableMetaData.js.map