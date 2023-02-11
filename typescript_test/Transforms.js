"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinCondition = void 0;
class JoinCondition {
    constructor(keys) {
        this.keys = keys;
    }
    checkCondition(row_A, row_B) {
        for (let key of this.keys) {
            if (row_A.row[key.col_nr_A] == row_B.row[key.col_nr_B]) {
                //console.log("checking " + key.col_nr_A + "/" + key.col_nr_B + " : " + row_A.row[key.col_nr_A] + "/" + row_B.row[key.col_nr_B] + "-> true");                
            }
            else {
                //console.log("checking " + key.col_nr_A + "/" + key.col_nr_B + " : " + row_A.row[key.col_nr_A] + "/" + row_B.row[key.col_nr_B] + "-> false");
                return false;
            }
        }
        return true;
    }
}
exports.JoinCondition = JoinCondition;
//# sourceMappingURL=Transforms.js.map