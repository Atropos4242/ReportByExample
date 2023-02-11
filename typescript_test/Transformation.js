"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationalTransform = exports.OrderCondition = exports.GroupColumn = exports.Join = void 0;
const Table_1 = require("./Table");
class Join {
    constructor(sourceA, sourceB, join_conditions) {
        this.sourceA = sourceA;
        this.sourceB = sourceB;
        this.join_conditions = join_conditions;
    }
}
exports.Join = Join;
class GroupColumn {
    constructor(col_nr, name, group_mode) {
        this.col_nr = col_nr;
        this.name = name;
        this.group_mode = group_mode;
    }
}
exports.GroupColumn = GroupColumn;
class OrderCondition {
    constructor(col_nr, name, order_mode) {
        this.col_nr = col_nr;
        this.name = name;
        this.order_mode = order_mode;
    }
}
exports.OrderCondition = OrderCondition;
class RelationalTransform {
    join(source, sourceResult, join) {
        console.log("Join: " + join.sourceA + " + " + join.sourceB + " -> " + sourceResult);
        console.log("");
        let result = this.join_intern(sourceResult, source.getTable(join.sourceA), source.getTable(join.sourceB), join.join_conditions);
        // console.log( result.toText());
        return source.addTable(result);
    }
    order(source, sourceResult, data, order) {
        console.log("Order: " + data.name + " -> " + sourceResult);
        for (let o of order) {
            console.log(o.name + " (" + o.col_nr + ")" + " " + o.order_mode);
        }
        console.log("");
        let result = this.order_intern(sourceResult, data, order);
        // console.log( result.toText());
        return source.addTable(result);
    }
    group(source, sourceResult, data, group) {
        console.log("Group: " + data.name + " -> " + sourceResult);
        for (let grp of group) {
            console.log(grp.name + " (" + grp.col_nr + ")" + " " + grp.group_mode);
        }
        console.log("");
        let result = this.group_intern(sourceResult, data, group);
        // console.log( result.toText());
        return source.addTable(result);
    }
    order_intern(name, data, orderCond) {
        let res_columns = data.columns;
        let result = new Table_1.Table(name, res_columns);
        var sortedArray = data.rows.sort((n1, n2) => {
            for (let oc of orderCond) {
                if (n1.row[oc.col_nr] > n2.row[oc.col_nr]) {
                    if (oc.order_mode == "ASC")
                        return 1;
                    else
                        return -1;
                }
                if (n1.row[oc.col_nr] < n2.row[oc.col_nr]) {
                    if (oc.order_mode == "ASC")
                        return -1;
                    else
                        return 1;
                }
            }
            return 0;
        });
        result.rows = sortedArray;
        return result;
    }
    project_intern(name, data, prjCond) {
        let res_columns = [];
        let keep_cols = [];
        for (let col of data.columns) {
            for (let grpCol of prjCond) {
                if (col.col_nr == grpCol.col_nr) {
                    res_columns.push(col);
                    keep_cols.push(col.col_nr);
                }
            }
        }
        let result = new Table_1.Table(name, res_columns);
        result.rows = [];
        for (let row of data.rows) {
            let r = new Table_1.Row();
            for (let keep_col_inx of keep_cols) {
                r.row.push(row.row[keep_col_inx]);
            }
            result.rows.push(r);
        }
        return result;
    }
    group_intern(name, data, grpCond) {
        let result = data;
        let keys = []; //Liste der Spaltennummern der Group-Spalten
        let aggs = []; //Liste der Spaltennummern der Agg-Spalten
        let orderCond = [];
        for (let gc of grpCond) {
            if (gc.group_mode == "key") {
                let oc = new OrderCondition(gc.col_nr, gc.name, 'ASC');
                orderCond.push(oc);
                keys.push(oc.col_nr);
            }
            else
                aggs.push(gc.col_nr);
        }
        result = this.order_intern(name, result, orderCond);
        //console.log(result.toText());   
        let groupResult = new Table_1.Table(name, result.columns);
        groupResult.rows = new Array();
        let lastKeys = []; //letzter Zustand der Group-Spalten
        let lastRow;
        let sum = new Array(result.columns.length); //summiert alle agg-Spalten        
        let count = 0;
        let newGrp = false;
        let first = true;
        for (let a = 0; a < sum.length; a++) {
            sum[a] = 0;
        }
        for (let r of result.rows) {
            for (let k of keys) {
                //neue Group-Spalten-Einträge -> neue Gruppe
                if (lastKeys[k] != r.row[k]) {
                    lastKeys[k] = r.row[k];
                    if (!first)
                        newGrp = true;
                }
            }
            if (newGrp) {
                let newRow = lastRow;
                for (let a of aggs) {
                    newRow.row[a] = sum[a];
                }
                //console.log( "new Row: " + sum + " " + count + " - " + newRow.row );
                groupResult.rows.push(newRow);
                for (let a of aggs) {
                    sum[a] = 0;
                }
                count = 1;
                newGrp = false;
            }
            for (let a of aggs) {
                sum[a] += r.row[a];
            }
            lastRow = r;
            first = false;
        }
        let newRow = lastRow;
        for (let a of aggs) {
            newRow.row[a] = sum[a];
        }
        //console.log( "new Row: " + sum + " " + count + " - " + newRow.row );
        groupResult.rows.push(newRow);
        // console.log( groupResult.toText());   
        result = this.project_intern(name, groupResult, grpCond);
        return result;
    }
    join_intern(name, dataA, dataB, joinCond) {
        let res_columns = [];
        let nr = 0;
        for (let col of dataA.columns) {
            let c = { "col_nr": nr, "name": dataA.name + ":" + col.name };
            res_columns.push(c);
            nr++;
        }
        for (let col of dataB.columns) {
            let c = { "col_nr": nr, "name": dataB.name + ":" + col.name };
            res_columns.push(c);
            nr++;
        }
        let result = new Table_1.Table(name, res_columns);
        for (let rowA of dataA.rows) {
            for (let rowB of dataB.rows) {
                if (this.checkCondition(joinCond, rowA, rowB)) {
                    let r = new Table_1.Row();
                    for (let value of rowA.row) {
                        r.row.push(value);
                    }
                    for (let value of rowB.row) {
                        r.row.push(value);
                    }
                    result.rows.push(r);
                }
            }
        }
        return result;
    }
    checkCondition(condition, row_A, row_B) {
        let result = condition(row_A, row_B);
        if (result) {
            // console.log("checking -> true");                
            return true;
        }
        else {
            // console.log("checking -> false");
            return false;
        }
    }
}
exports.RelationalTransform = RelationalTransform;
//# sourceMappingURL=Transformation.js.map