import { DataSource } from "./DataSource"
import { Row, Table } from "./Table"
import { ColumnType, GroupConditionType, JoinConditionType, OrderConditionType, ProjectConditionType, TableMetaDataTreeConColFltType, TransformationBlowupType, TransformationGroupType, TransformationJoinType, TransformationOrderType, TransformationTreeConType, TransformationType } from "./TableDataStructures";

export function doTransformation(source: DataSource, trans: TransformationType): string {
    if (trans.type == "JOIN_FULL_TABLE_SCAN") {
        return join(source, trans as TransformationJoinType);
    }
    if (trans.type == "GROUP") {
        return group(source, trans as TransformationGroupType);
    }
    if (trans.type == "ORDER") {
        return order(source, trans as TransformationOrderType);
    }
    if (trans.type == "BLOWUP") {
        return blowup(source, trans as TransformationBlowupType);
    }
    if (trans.type == "TREECON") {
        return treeCon(source, trans as TransformationTreeConType);
    }
    //throw new Error("Unknown transformation found " + trans.sourceA + " " + trans.type);

}

export function transformationError(condition, trans, errText) {
    if (condition) throw new Error("Error in transformation " + trans.type + " [" + trans.name + "]" + ": " + errText);
}

export function treeCon(source: DataSource, trans: TransformationTreeConType): string {
    console.log("TreeCon-Transformation");
    try {
        transformationError(trans.sourceResult == undefined, trans, "sourceResult is empty");
        transformationError(source.getTable(trans.sourceA) == undefined, trans, "Table " + trans.sourceA + " not found");
        transformationError(source.getTable(trans.sourceB) == undefined, trans, "Table " + trans.sourceB + " not found");
        return source.addTable(treeCon_intern(source.getTable(trans.sourceA), source.getTable(trans.sourceB), trans.sourceResult, trans.name));
    } catch(e: any ) {
        console.log( "Error in Transformation TreeCon [" + trans.name + "]: " + e );
        throw Error(e);
    }
}

//Calculates the sum of one column of table "data" with consideration to the given filters
function treeConSumIf( data: Table, col_name: string, filterCol: TableMetaDataTreeConColFltType[], filterRow: TableMetaDataTreeConColFltType[], basisTable: Table, basisRow: Row ) : number {
    let result: number = 0;
    let col_inx: number = data.getColNumberByName(col_name);

    for (let inx = 0; inx < data.rows.length; inx++) {
        let filter_result: boolean = true;

        //Filter of ColumnMetaData
        for (let inx_filter = 0; filterCol != undefined && inx_filter < filterCol.length; inx_filter++) {
            if( filterCol[inx_filter].FLT_VALUE != undefined && filterCol[inx_filter].FLT_VALUE != data.rows[inx].row[data.getColNumberByName(filterCol[inx_filter].FLT_COL)]) {
                filter_result = false;
                break;
            }
        }

        //Filter of RowMetaData
        for (let inx_filter = 0; filterRow != undefined && filter_result && inx_filter < filterRow.length; inx_filter++) {
            if( 
                (filterRow[inx_filter].FLT_VALUE != undefined && 
                filterRow[inx_filter].FLT_VALUE != data.rows[inx].row[data.getColNumberByName(filterRow[inx_filter].FLT_COL)] ) 
                ||
                (filterRow[inx_filter].FLT_VALUE_COLUMN != undefined && 
                basisRow.row[basisTable.getColNumberByName(filterRow[inx_filter].FLT_VALUE_COLUMN)] != data.rows[inx].row[data.getColNumberByName(filterRow[inx_filter].FLT_COL)])
            )
            {
                filter_result = false;
                break;
            }
        }

        if( filter_result ) result = result + data.rows[inx].row[col_inx];
    }

    return result;
}

function treeCon_intern(data_basis: Table, data_dimension: Table, result_table_name: string, transName: string): Table {
    //console.log("TreeCon-Transformation intern");

    let result = new Table(result_table_name, data_basis.columns);

    for (let inx = 0; inx < data_basis.rows.length; inx++) {
        let row = data_basis.rows[inx];

        for ( let col_inx= 0 ; col_inx < data_basis.columns.length ; col_inx++) { 

            if( 
                data_basis.columns[col_inx].columnMetaData?.TREECON?.AGG_COL != undefined && 
                data_basis.columns[col_inx].columnMetaData?.TREECON?.TRANS_NAME==transName &&
                row.rowMetaData?.TREECON?.TRANS_NAME==transName
            ) {
                let filterColMeta: TableMetaDataTreeConColFltType[] = data_basis.columns[col_inx].columnMetaData?.TREECON?.COL_FLT;
                let filterRowMeta: TableMetaDataTreeConColFltType[] = row.rowMetaData?.TREECON?.COL_FLT;
    
                row.row[col_inx] = treeConSumIf(
                    data_dimension, 
                    data_basis.columns[col_inx].columnMetaData.TREECON.AGG_COL, 
                    filterColMeta, 
                    filterRowMeta,
                    data_basis,
                    row
                );        
            }
        }
        result.rows.push(row);
    }

    return result;
}

export function blowup(source: DataSource, trans: TransformationBlowupType): string {
    console.log("Blowup-Transformation");

    transformationError(trans.sourceResult == undefined, trans, "sourceResult is empty");
    transformationError(source.getTable(trans.sourceA) == undefined, trans, "Table " + trans.sourceA + " not found");
    transformationError(source.getTable(trans.sourceB) == undefined, trans, "Table " + trans.sourceB + " not found");

    transformationError(source.getTable(trans.sourceA).columns.find(x => x.name == trans.blowup_srcA_col_name) == undefined, trans, "Column " + trans.blowup_srcA_col_name + " not found in table " + trans.sourceA);
    transformationError(source.getTable(trans.sourceB).columns.find(x => x.name == trans.blowup_srcB_col_name) == undefined, trans, "Column " + trans.blowup_srcB_col_name + " not found in table " + trans.sourceB);

    for (let inx = 0; inx < source.getTable(trans.sourceA).rows.length; inx++) {
        if (
            source.getTable(trans.sourceA).getColMetaData[inx] != undefined &&
            source.getTable(trans.sourceA).getColMetaData[inx].blowup != undefined &&
            source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_COLUMN != undefined &&
            source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_TARGET_COLUMN != undefined
        ) {
            let col_nr_A = source.getTable(trans.sourceA).columns.find(x => x.name == source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_COLUMN).col_nr;
            let col_nr_B = source.getTable(trans.sourceB).columns.find(x => x.name == source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_TARGET_COLUMN).col_nr;
            source.getTable(trans.sourceA).getColMetaData[inx].blowup.setBlowupColumns(col_nr_A, col_nr_B);
        }
    }

    return source.addTable(blowup_intern(source.getTable(trans.sourceA), source.getTable(trans.sourceB), trans.sourceResult));
}

function blowup_intern(data_basis: Table, data_dimension: Table, result_table_name: string): Table {
    //console.log("Blowup-Transformation intern");

    let result = new Table(result_table_name, data_basis.columns);

    for (let inx = 0; inx < data_basis.rows.length; inx++) {
        let row = data_basis.rows[inx];
        //row for blowing up is marked with "BLOWUP" as content
        if (data_basis?.getRowMetaData(inx)?.BLOWUP != undefined) {
            //console.log(data_basis.meta_data[inx].toText());
            for (let rowdim of data_dimension.rows) {

                let new_row: Row = new Row();
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
                new_row.rowMetaData=row.rowMetaData;

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

export function join(source: DataSource, join: TransformationJoinType): string {
    for (let cond of join.join_conditions) {
        cond.srcA.col_nr = source.getTable(join.sourceA).columns.find(x => x.name == cond.srcA.col_name).col_nr;
        cond.srcB.col_nr = source.getTable(join.sourceB).columns.find(x => x.name == cond.srcB.col_name).col_nr;
    }

    console.log(join.name + " [" + join.type + "]");
    console.log(join.sourceA + " + " + join.sourceB + " -> " + join.sourceResult);
    for (let cond of join.join_conditions) {
        console.log(cond.srcA.col_name + " (" + cond.srcA.col_nr + ")" + " " + cond.operation + " " + cond.srcB.col_name + " (" + cond.srcB.col_nr + ")")
    }
    console.log("");

    let result: Table = join_intern(join.sourceResult, source.getTable(join.sourceA), source.getTable(join.sourceB), join.join_conditions);
    console.log(result.toText(true));

    return source.addTable(result);
}

export function order(source: DataSource, order: TransformationOrderType): string {
    let result: Table = order_intern(order.sourceResult, source.getTable(order.source), order.order_columns);
    console.log(result.toText(true));

    return source.addTable(result);
}

export function order_intern(name: string, data: Table, orderCond: OrderConditionType[]): Table {
    let res_columns: ColumnType[] = data.columns;
    let result = new Table(name, res_columns);

    var sortedArray: Row[] = data.rows.sort((n1, n2) => {
        for (let oc of orderCond) {
            if (n1.row[oc.col_nr] > n2.row[oc.col_nr]) {
                if (oc.order_mode == "ASC")
                    return 1;
                else
                    return -1
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

export function group(source: DataSource, group: TransformationGroupType): string {
    // console.log(group.name + " [" + group.type + "]");
    // console.log(group.source + " -> " + group.sourceResult);
    // for (let grp of group.group_columns) {
    //     console.log(grp.name + " " + grp.group_mode);
    // }
    // console.log("");

    return source.addTable(group_intern(group.sourceResult, source.getTable(group.source), group.group_columns));
}

export function project_intern(name: string, data: Table, prjCond: ProjectConditionType[]): Table {
    let res_columns: ColumnType[] = [];
    let keep_cols: number[] = [];

    for (let col of data.columns) {
        let col_nr: number = data.getColNumberByName(col.name);
        for (let grpCol of prjCond) {
            let grp_col_nr: number = data.getColNumberByName(grpCol.name);
            if (col_nr == grp_col_nr) {
                res_columns.push(col);
                keep_cols.push(col_nr)
            }
        }
    }
    let result = new Table(name, res_columns);
    result.rows = [];

    for (let row of data.rows) {
        let r: Row = new Row();
        for (let keep_col_inx of keep_cols) {
            r.row.push(row.row[keep_col_inx]);
        }
        result.rows.push(r);
    }

    return result;
}

export function group_intern(name: string, data: Table, grpCond: GroupConditionType[]): Table {
    let keys: any[] = []; //Liste der Spaltennummern der Group-Spalten
    let aggs: number[] = []; //Liste der Spaltennummern der Agg-Spalten
    let orderCond: OrderConditionType[] = [];
    for (let gc of grpCond) {
        if (gc.group_mode == "key") {
            let oc: OrderConditionType = {};
            //oc.col_nr = data.getColNumberByName(gc.name);
            oc.name = gc.name;
            oc.order_mode = 'ASC';
            orderCond.push(oc);
            keys.push(data.getColNumberByName(gc.name));
        }
        else aggs.push(data.getColNumberByName(gc.name));
    }

    let result: Table = order_intern(name, data, orderCond);
    //console.log( "group_intern -> order_intern" );
    //console.log(result.toText(true));   

    let groupResult: Table = new Table(name, result.columns);
    groupResult.rows = new Array<Row>();

    let lastKeys: any[] = []; //letzter Zustand der Group-Spalten
    let lastRow: Row;
    let sum = new Array<number>(result.columns.length); //summiert alle agg-Spalten        
    let count: number = 0;
    let newGrp: boolean = false;
    let first: boolean = true;

    for (let a = 0; a < sum.length; a++) {
        sum[a] = 0;
    }

    for (let r of result.rows) {
        for (let k of keys) {
            //neue Group-Spalten-Einträge -> neue Gruppe
            if (lastKeys[k] != r.row[k]) {
                lastKeys[k] = r.row[k];
                if (!first) newGrp = true;
            }
        }
        if (newGrp) {
            let newRow: Row = lastRow;
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
    let newRow: Row = lastRow;
    for (let a of aggs) {
        newRow.row[a] = sum[a];
    }
    //console.log( "new Row: " + sum + " " + count + " - " + newRow.row );
    groupResult.rows.push(newRow);

    //console.log( "group_intern result" );
    //console.log(groupResult.toText(true));

    result = project_intern(name, groupResult, grpCond as ProjectConditionType[]);
    //console.log( "group_intern -> project_intern" );
    //console.log(result.toText(true));

    return result;
}

export function join_intern(name: string, dataA: Table, dataB: Table, joinCond: JoinConditionType[]): Table {
    let res_columns: ColumnType[] = [];
    let nr: number = 0;
    for (let col of dataA.columns) {
        let c: ColumnType = { "col_nr": nr, "name": dataA.name + ":" + col.name };
        res_columns.push(c);
        nr++;
    }
    for (let col of dataB.columns) {
        let c: ColumnType = { "col_nr": nr, "name": dataB.name + ":" + col.name };
        res_columns.push(c);
        nr++;
    }
    let result = new Table(name, res_columns);

    for (let rowA of dataA.rows) {
        for (let rowB of dataB.rows) {
            if (checkCondition(joinCond, rowA, rowB)) {
                let r: Row = new Row();
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

export function checkCondition(conditions: JoinConditionType[], row_A: Row, row_B: Row): boolean {
    for (let key of conditions) {
        if (row_A.row[key.srcA.col_nr] == row_B.row[key.srcB.col_nr]) {
            //console.log("checking " + key.srcA.col_nr + "/" + key.srcB.col_nr + " : " + row_A.row[key.srcA.col_nr] + "/" + row_B.row[key.srcB.col_nr] + "-> true");                
        } else {
            //console.log("checking " + key.srcA.col_nr + "/" + key.srcB.col_nr + " : " + row_A.row[key.srcA.col_nr] + "/" + row_B.row[key.srcB.col_nr] + "-> false");
            return false;
        }
    }

    return true;
}

export function checkConditionExpression(condition: (row_A: Row, row_B: Row) => boolean, row_A: Row, row_B: Row): boolean {
    let result: boolean = condition(row_A, row_B);
    if (result) {
        console.log("checking -> true");
        return true;
    } else {
        console.log("checking -> false");
        return false;
    }
}

