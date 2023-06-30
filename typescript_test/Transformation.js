"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConditionExpression = exports.checkCondition = exports.join_intern = exports.group_intern = exports.project_intern = exports.group = exports.order_intern = exports.order = exports.join = exports.blowup = exports.treeCon = exports.transformationError = exports.doTransformation = void 0;
const Table_1 = require("./Table");
function doTransformation(source, trans) {
    if (trans.type == "JOIN_FULL_TABLE_SCAN") {
        return join(source, trans);
    }
    if (trans.type == "GROUP") {
        return group(source, trans);
    }
    if (trans.type == "ORDER") {
        return order(source, trans);
    }
    if (trans.type == "BLOWUP") {
        return blowup(source, trans);
    }
    if (trans.type == "TREECON") {
        return treeCon(source, trans);
    }
    //throw new Error("Unknown transformation found " + trans.sourceA + " " + trans.type);
}
exports.doTransformation = doTransformation;
function transformationError(condition, trans, errText) {
    if (condition)
        throw new Error("Error in transformation " + trans.type + " [" + trans.name + "]" + ": " + errText);
}
exports.transformationError = transformationError;
function treeCon(source, trans) {
    console.log("TreeCon-Transformation");
    try {
        transformationError(trans.sourceResult == undefined, trans, "sourceResult is empty");
        transformationError(source.getTable(trans.sourceA) == undefined, trans, "Table " + trans.sourceA + " not found");
        transformationError(source.getTable(trans.sourceB) == undefined, trans, "Table " + trans.sourceB + " not found");
        return source.addTable(treeCon_intern(source.getTable(trans.sourceA), source.getTable(trans.sourceB), trans.sourceResult, trans.name));
    }
    catch (e) {
        console.log("Error in Transformation TreeCon [" + trans.name + "]: " + e);
        throw Error(e);
    }
}
exports.treeCon = treeCon;
//Calculates the sum of one column of table "data" with consideration to the given filters
function treeConSumIf(data, col_name, filterCol, filterRow, basisTable, basisRow) {
    let result = 0;
    let col_inx = data.getColNumberByName(col_name);
    for (let inx = 0; inx < data.rows.length; inx++) {
        let filter_result = true;
        //Filter of ColumnMetaData
        for (let inx_filter = 0; filterCol != undefined && inx_filter < filterCol.length; inx_filter++) {
            if (filterCol[inx_filter].FLT_VALUE != undefined && filterCol[inx_filter].FLT_VALUE != data.rows[inx].row[data.getColNumberByName(filterCol[inx_filter].FLT_COL)]) {
                filter_result = false;
                break;
            }
        }
        //Filter of RowMetaData
        for (let inx_filter = 0; filterRow != undefined && filter_result && inx_filter < filterRow.length; inx_filter++) {
            if ((filterRow[inx_filter].FLT_VALUE != undefined &&
                filterRow[inx_filter].FLT_VALUE != data.rows[inx].row[data.getColNumberByName(filterRow[inx_filter].FLT_COL)])
                ||
                    (filterRow[inx_filter].FLT_VALUE_COLUMN != undefined &&
                        basisRow.row[basisTable.getColNumberByName(filterRow[inx_filter].FLT_VALUE_COLUMN)] != data.rows[inx].row[data.getColNumberByName(filterRow[inx_filter].FLT_COL)])) {
                filter_result = false;
                break;
            }
        }
        if (filter_result)
            result = result + data.rows[inx].row[col_inx];
    }
    return result;
}
function treeCon_intern(data_basis, data_dimension, result_table_name, transName) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    console.log("TreeCon-Transformation intern");
    let result = new Table_1.Table(result_table_name, data_basis.columns);
    for (let inx = 0; inx < data_basis.rows.length; inx++) {
        let row = data_basis.rows[inx];
        for (let col_inx = 0; col_inx < data_basis.columns.length; col_inx++) {
            if (((_b = (_a = data_basis.columns[col_inx].columnMetaData) === null || _a === void 0 ? void 0 : _a.TREECON) === null || _b === void 0 ? void 0 : _b.AGG_COL) != undefined &&
                ((_d = (_c = data_basis.columns[col_inx].columnMetaData) === null || _c === void 0 ? void 0 : _c.TREECON) === null || _d === void 0 ? void 0 : _d.TRANS_NAME) == transName &&
                ((_f = (_e = row.rowMetaData) === null || _e === void 0 ? void 0 : _e.TREECON) === null || _f === void 0 ? void 0 : _f.TRANS_NAME) == transName) {
                let filterColMeta = (_h = (_g = data_basis.columns[col_inx].columnMetaData) === null || _g === void 0 ? void 0 : _g.TREECON) === null || _h === void 0 ? void 0 : _h.COL_FLT;
                let filterRowMeta = (_k = (_j = row.rowMetaData) === null || _j === void 0 ? void 0 : _j.TREECON) === null || _k === void 0 ? void 0 : _k.COL_FLT;
                row.row[col_inx] = treeConSumIf(data_dimension, data_basis.columns[col_inx].columnMetaData.TREECON.AGG_COL, filterColMeta, filterRowMeta, data_basis, row);
            }
        }
        result.rows.push(row);
    }
    return result;
}
function blowup(source, trans) {
    console.log("Blowup-Transformation");
    transformationError(trans.sourceResult == undefined, trans, "sourceResult is empty");
    transformationError(source.getTable(trans.sourceA) == undefined, trans, "Table " + trans.sourceA + " not found");
    transformationError(source.getTable(trans.sourceB) == undefined, trans, "Table " + trans.sourceB + " not found");
    transformationError(source.getTable(trans.sourceA).columns.find(x => x.name == trans.blowup_srcA_col_name) == undefined, trans, "Column " + trans.blowup_srcA_col_name + " not found in table " + trans.sourceA);
    transformationError(source.getTable(trans.sourceB).columns.find(x => x.name == trans.blowup_srcB_col_name) == undefined, trans, "Column " + trans.blowup_srcB_col_name + " not found in table " + trans.sourceB);
    for (let inx = 0; inx < source.getTable(trans.sourceA).rows.length; inx++) {
        if (source.getTable(trans.sourceA).getColMetaData[inx] != undefined &&
            source.getTable(trans.sourceA).getColMetaData[inx].blowup != undefined &&
            source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_COLUMN != undefined &&
            source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_TARGET_COLUMN != undefined) {
            let col_nr_A = source.getTable(trans.sourceA).columns.find(x => x.name == source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_COLUMN).col_nr;
            let col_nr_B = source.getTable(trans.sourceB).columns.find(x => x.name == source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_TARGET_COLUMN).col_nr;
            source.getTable(trans.sourceA).getColMetaData[inx].blowup.setBlowupColumns(col_nr_A, col_nr_B);
        }
    }
    return source.addTable(blowup_intern(source.getTable(trans.sourceA), source.getTable(trans.sourceB), trans.sourceResult));
}
exports.blowup = blowup;
function blowup_intern(data_basis, data_dimension, result_table_name) {
    var _a;
    console.log("Blowup-Transformation intern");
    let result = new Table_1.Table(result_table_name, data_basis.columns);
    for (let inx = 0; inx < data_basis.rows.length; inx++) {
        let row = data_basis.rows[inx];
        //row for blowing up is marked with "BLOWUP" as content
        if (((_a = data_basis === null || data_basis === void 0 ? void 0 : data_basis.getRowMetaData(inx)) === null || _a === void 0 ? void 0 : _a.BLOWUP) != undefined) {
            //console.log(data_basis.meta_data[inx].toText());
            for (let rowdim of data_dimension.rows) {
                let new_row = new Table_1.Row();
                //copy row and replace one column         
                for (let a = 0; a < row.row.length; a++) {
                    if (data_basis.columns[a].name == data_basis.getRowMetaData(inx).BLOWUP.COLUMN) {
                        new_row.row.push(rowdim.row[data_dimension.getColNumberByName(data_basis.getRowMetaData(inx).BLOWUP.TARGET_COLUMN)]);
                    }
                    else {
                        new_row.row.push(row.row[a]);
                    }
                }
                //copy Metadata
                new_row.rowMetaData = row.rowMetaData;
                result.rows.push(new_row);
            }
        }
        //plain copy any other row
        else {
            result.rows.push(row);
        }
    }
    return result;
}
function join(source, join) {
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
    let result = join_intern(join.sourceResult, source.getTable(join.sourceA), source.getTable(join.sourceB), join.join_conditions);
    console.log(result.toText(true));
    return source.addTable(result);
}
exports.join = join;
function order(source, order) {
    let result = order_intern(order.sourceResult, source.getTable(order.source), order.order_columns);
    console.log(result.toText(true));
    return source.addTable(result);
}
exports.order = order;
function order_intern(name, data, orderCond) {
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
exports.order_intern = order_intern;
function group(source, group) {
    console.log(group.name + " [" + group.type + "]");
    console.log(group.source + " -> " + group.sourceResult);
    for (let grp of group.group_columns) {
        console.log(grp.name + " (" + grp.col_nr + ")" + " " + grp.group_mode);
    }
    console.log("");
    return source.addTable(group_intern(group.sourceResult, source.getTable(group.source), group.group_columns));
}
exports.group = group;
function project_intern(name, data, prjCond) {
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
exports.project_intern = project_intern;
function group_intern(name, data, grpCond) {
    let result = data;
    let keys = []; //Liste der Spaltennummern der Group-Spalten
    let aggs = []; //Liste der Spaltennummern der Agg-Spalten
    let orderCond = [];
    for (let gc of grpCond) {
        if (gc.group_mode == "key") {
            let oc;
            oc.col_nr = gc.col_nr;
            oc.name = gc.name;
            oc.order_mode = 'ASC';
            orderCond.push(oc);
            keys.push(oc.col_nr);
        }
        else
            aggs.push(gc.col_nr);
    }
    result = order_intern(name, result, orderCond);
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
    console.log(groupResult.toText(true));
    result = project_intern(name, groupResult, grpCond);
    return result;
}
exports.group_intern = group_intern;
function join_intern(name, dataA, dataB, joinCond) {
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
            if (checkCondition(joinCond, rowA, rowB)) {
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
exports.join_intern = join_intern;
function checkCondition(conditions, row_A, row_B) {
    for (let key of conditions) {
        if (row_A.row[key.srcA.col_nr] == row_B.row[key.srcB.col_nr]) {
            //console.log("checking " + key.srcA.col_nr + "/" + key.srcB.col_nr + " : " + row_A.row[key.srcA.col_nr] + "/" + row_B.row[key.srcB.col_nr] + "-> true");                
        }
        else {
            //console.log("checking " + key.srcA.col_nr + "/" + key.srcB.col_nr + " : " + row_A.row[key.srcA.col_nr] + "/" + row_B.row[key.srcB.col_nr] + "-> false");
            return false;
        }
    }
    return true;
}
exports.checkCondition = checkCondition;
function checkConditionExpression(condition, row_A, row_B) {
    let result = condition(row_A, row_B);
    if (result) {
        console.log("checking -> true");
        return true;
    }
    else {
        console.log("checking -> false");
        return false;
    }
}
exports.checkConditionExpression = checkConditionExpression;
//# sourceMappingURL=Transformation.js.map