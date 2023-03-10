"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationalTransform = exports.OrderCondition = void 0;
const Table_1 = require("./Table");
class OrderCondition {
}
exports.OrderCondition = OrderCondition;
class RelationalTransform {
    doTransformation(source, trans) {
        if (trans.type == "JOIN_FULL_TABLE_SCAN") {
            return this.join(source, trans);
        }
        if (trans.type == "GROUP") {
            return this.group(source, trans);
        }
        if (trans.type == "ORDER") {
            return this.order(source, trans);
        }
    }
    join(source, join) {
        for (let cond of join.join_conditions) {
            cond.srcA.col_nr = source.getTable(join.sourceA).columns.find(x => x.name == cond.srcA.col_name).col_nr;
            cond.srcB.col_nr = source.getTable(join.sourceB).columns.find(x => x.name == cond.srcB.col_name).col_nr;
        }
        console.log(join.name + " [" + join.type + "]");
        console.log(join.sourceA + " + " + join.sourceB + " -> " + join.sourceResult);
        for (let cond of join.join_conditions) {
            console.log(cond.srcA.col_name + " (" + cond.srcA.col_nr + ")" + " " + cond.operation + " " + cond.srcB.col_name + " (" + cond.srcB.col_nr + ")");
        }
        console.log("");
        let result = this.join_intern(join.sourceResult, source.getTable(join.sourceA), source.getTable(join.sourceB), join.join_conditions);
        //console.log( result.toText());
        return source.addTable(result);
    }
    order(source, order) {
        let result = this.order_intern(order.sourceResult, source.getTable(order.source), order.order_columns);
        //console.log( result.toText());
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
    group(source, group) {
        console.log(group.name + " [" + group.type + "]");
        console.log(group.source + " -> " + group.sourceResult);
        for (let grp of group.group_columns) {
            console.log(grp.name + " (" + grp.col_nr + ")" + " " + grp.group_mode);
        }
        console.log("");
        return source.addTable(this.group_intern(group.sourceResult, source.getTable(group.source), group.group_columns));
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
                let oc = new OrderCondition();
                oc.col_nr = gc.col_nr;
                oc.name = gc.name;
                oc.order_mode = 'ASC';
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
                //neue Group-Spalten-Eintr??ge -> neue Gruppe
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
        console.log(groupResult.toText());
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
    checkCondition(conditions, row_A, row_B) {
        for (let key of conditions) {
            if (row_A.row[key.srcA.col_nr] == row_B.row[key.srcB.col_nr]) {
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
exports.RelationalTransform = RelationalTransform;
//# sourceMappingURL=Transformation.js.map