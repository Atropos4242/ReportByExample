"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConditionExpression = exports.checkCondition = exports.join_intern = exports.group_intern = exports.project_intern = exports.group = exports.order_intern = exports.order = exports.join = exports.blowup = exports.treeCon = exports.transformationError = exports.computedLine = exports.doTransformation = void 0;
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
    if (trans.type == "COMP_LINE") {
        return computedLine(source, trans);
    }
    //throw new Error("Unknown transformation found " + trans.sourceA + " " + trans.type);
}
exports.doTransformation = doTransformation;
function computedLine_intern(data, transExpr, filter_col, col_selector, result_table_name, transName) {
    let result = new Table_1.Table(result_table_name, data.columns);
    let targetLine;
    //iterate over all rows
    for (let inx = 0; inx < data.rows.length; inx++) {
        let filter_result = false;
        //iterate over all LineSelectors
        for (let inx_ls = 0; inx_ls < filter_col.length; inx_ls++) {
            filter_result = true;
            //iterate over all Column-Filter (of each LineSelector)
            for (let inx_cf = 0; inx_cf < filter_col[inx_ls].COL_FLT.length; inx_cf++) {
                if (filter_col[inx_ls].COL_FLT[inx_cf] != undefined && filter_col[inx_ls].COL_FLT[inx_cf].FLT_VALUE != data.rows[inx].row[data.getColNumberByName(filter_col[inx_ls].COL_FLT[inx_cf].FLT_COL)]) {
                    filter_result = false;
                    break;
                }
            }
            if (filter_result) {
                if (filter_col[inx_ls].NAME == "TARGET")
                    targetLine = data.rows[inx];
                result.addMarkedLine(data.rows[inx], filter_col[inx_ls].NAME);
                break;
            }
        }
        if (!filter_result)
            result.rows.push(data.rows[inx]);
    }
    if (targetLine == undefined)
        throw Error("No TARGET Line-Selector defined!");
    //let new_row = new Row();
    //new_row.row= Array.from(result.rows[0].row);
    for (let sel_inx = 0; sel_inx < col_selector.length; sel_inx++) {
        let col_nr = data.getColNumberByName(col_selector[sel_inx]);
        let parameter = "";
        for (const marker of result.getMarkedLinesMarker()) {
            parameter += `let ${marker}=${result.getMarkedLine(marker).row[col_nr]};\n`;
        }
        let expr = parameter + transExpr;
        //console.log(" Calculating " + expr );
        let expr_res = eval(expr);
        //console.log(expr_res);
        targetLine.row[col_nr] = expr_res;
    }
    //result.rows.push(targetLine);
    return result;
}
function computedLine(source, trans) {
    var _a, _b;
    console.log("ComputedLine-Transformation");
    try {
        transformationError(trans.sourceResult == undefined, trans, "sourceResult is empty");
        transformationError(source.getTable(trans.sourceA) == undefined, trans, "Table " + trans.sourceA + " not found");
        transformationError(trans.LINE_SELECTOR == undefined, trans, "LINE_SELECTOR " + trans.name + " not found");
        transformationError(((_a = trans.LINE_SELECTOR) === null || _a === void 0 ? void 0 : _a.length) == 0, trans, "LINE_SELECTOR " + trans.name + " has length 0");
        transformationError(trans.COLUMN_SELECTOR == undefined, trans, "COLUMN_SELECTOR " + trans.name + " not found");
        transformationError(((_b = trans.COLUMN_SELECTOR) === null || _b === void 0 ? void 0 : _b.length) == 0, trans, "COLUMN_SELECTOR " + trans.name + " has length 0");
        return source.addTable(computedLine_intern(source.getTable(trans.sourceA), trans.EXPRESSION, trans.LINE_SELECTOR, trans.COLUMN_SELECTOR, trans.sourceResult, trans.name));
    }
    catch (e) {
        console.log("Error in Transformation ComputedLine [" + trans.name + "]: " + e);
        throw Error(e);
    }
}
exports.computedLine = computedLine;
function transformationError(condition, trans, errText) {
    if (condition)
        throw new Error("Error in transformation " + trans.type + " [" + trans.name + "]" + ": " + errText);
}
exports.transformationError = transformationError;
function treeCon(source, trans) {
    console.log("TreeCon-Transformation " + trans.name);
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
    //console.log("TreeCon-Transformation intern");
    var _a, _b, _c, _d;
    let result = new Table_1.Table(result_table_name, data_basis.columns);
    for (let inx = 0; inx < data_basis.rows.length; inx++) {
        let row = data_basis.rows[inx];
        for (let col_inx = 0; col_inx < data_basis.columns.length; col_inx++) {
            if (data_basis.getMetaData().getRowMetaData(inx, transName) != undefined &&
                ((_a = data_basis.getMetaData().getColTreeConMetaData(col_inx, transName)) === null || _a === void 0 ? void 0 : _a.AGG_COL)) {
                let filterColMeta = (_b = data_basis.getMetaData().getColTreeConMetaData(col_inx, transName)) === null || _b === void 0 ? void 0 : _b.COL_FLT;
                let filterRowMeta = (_c = data_basis.getMetaData().getRowTreeConMetaData(inx, transName)) === null || _c === void 0 ? void 0 : _c.COL_FLT;
                row.row[col_inx] = treeConSumIf(data_dimension, (_d = data_basis.getMetaData().getColTreeConMetaData(col_inx, transName)) === null || _d === void 0 ? void 0 : _d.AGG_COL, filterColMeta, filterRowMeta, data_basis, row);
            }
        }
        result.rows.push(row);
        //copy Row-Metadata
        for (const rmd of data_basis.getMetaData().getAllRowMetaData(inx)) {
            result.getMetaData().addRowMetaData(result.rows.length - 1, rmd);
        }
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
        if (source.getTable(trans.sourceA).getMetaData().getColMetaData(inx, trans.name) != undefined) {
            let col_nr_A = source.getTable(trans.sourceA).getColNumberByName(source.getTable(trans.sourceA).getMetaData().getColBlowupMetaData(inx, trans.name).COLUMN);
            let col_nr_B = source.getTable(trans.sourceB).getColNumberByName(source.getTable(trans.sourceB).getMetaData().getColBlowupMetaData(inx, trans.name).TARGET_COLUMN);
            source.getTable(trans.sourceA).getMetaData().getColMetaData[inx].blowup.setBlowupColumns(col_nr_A, col_nr_B);
        }
    }
    return source.addTable(blowup_intern(source.getTable(trans.sourceA), source.getTable(trans.sourceB), trans.sourceResult, trans.name));
}
exports.blowup = blowup;
function blowup_intern(data_basis, data_dimension, result_table_name, transName) {
    //console.log("Blowup-Transformation intern");
    let result = new Table_1.Table(result_table_name, data_basis.columns);
    for (let inx = 0; inx < data_basis.rows.length; inx++) {
        let row = data_basis.rows[inx];
        //row for blowing up is marked with BlowupMetaData
        if ((data_basis === null || data_basis === void 0 ? void 0 : data_basis.getMetaData().getRowBlowupMetaData(inx, transName)) != undefined) {
            //console.log(data_basis.meta_data[inx].toText());
            for (let rowdim of data_dimension.rows) {
                let new_row = new Table_1.Row();
                //copy row and replace one column         
                for (let a = 0; a < row.row.length; a++) {
                    if (data_basis.columns[a].name == data_basis.getMetaData().getRowBlowupMetaData(inx, transName).COLUMN) {
                        new_row.row.push(rowdim.row[data_dimension.getColNumberByName(data_basis.getMetaData().getRowBlowupMetaData(inx, transName).TARGET_COLUMN)]);
                    }
                    else {
                        new_row.row.push(row.row[a]);
                    }
                }
                result.rows.push(new_row);
                //copy Row-Metadata
                for (const rmd of data_basis.getMetaData().getAllRowMetaData(inx)) {
                    result.getMetaData().addRowMetaData(result.rows.length - 1, rmd);
                }
            }
        }
        //plain copy any other row
        else {
            result.rows.push(row);
            //copy Row-Metadata
            for (const rmd of data_basis.getMetaData().getAllRowMetaData(inx)) {
                result.getMetaData().addRowMetaData(result.rows.length - 1, rmd);
            }
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
    // console.log(group.name + " [" + group.type + "]");
    // console.log(group.source + " -> " + group.sourceResult);
    // for (let grp of group.group_columns) {
    //     console.log(grp.name + " " + grp.group_mode);
    // }
    // console.log("");
    return source.addTable(group_intern(group.sourceResult, source.getTable(group.source), group.group_columns));
}
exports.group = group;
function project_intern(name, data, prjCond) {
    let res_columns = [];
    let keep_cols = [];
    for (let col of data.columns) {
        let col_nr = data.getColNumberByName(col.name);
        for (let grpCol of prjCond) {
            let grp_col_nr = data.getColNumberByName(grpCol.name);
            if (col_nr == grp_col_nr) {
                res_columns.push(col);
                keep_cols.push(col_nr);
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
    let keys = []; //Liste der Spaltennummern der Group-Spalten
    let aggs = []; //Liste der Spaltennummern der Agg-Spalten
    let orderCond = [];
    for (let gc of grpCond) {
        if (gc.group_mode == "key") {
            let oc = {};
            //oc.col_nr = data.getColNumberByName(gc.name);
            oc.name = gc.name;
            oc.order_mode = 'ASC';
            orderCond.push(oc);
            keys.push(data.getColNumberByName(gc.name));
        }
        else
            aggs.push(data.getColNumberByName(gc.name));
    }
    let result = order_intern(name, data, orderCond);
    //console.log( "group_intern -> order_intern" );
    //console.log(result.toText(true));   
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
    //console.log( "group_intern result" );
    //console.log(groupResult.toText(true));
    result = project_intern(name, groupResult, grpCond);
    //console.log( "group_intern -> project_intern" );
    //console.log(result.toText(true));
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