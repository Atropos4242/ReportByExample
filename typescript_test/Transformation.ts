import { Dataset } from "./Dataset"
import { DataSource } from "./DataSource"
import { Column, Row, Table } from "./Table"

export type TransformationType = Join|Group|Order|Blowup|TreeCon;

interface Transformation {
    "name" : string,
    "type" : string
}

export interface Join extends Transformation {
    "sourceA" : string,
    "sourceB" : string,
    "sourceResult" : string,    
    "join_conditions": JoinCondition[]    
}

export interface Blowup extends Transformation {
    "sourceA" : string,
    "sourceB" : string,
    "sourceResult" : string,    
    "filter_col_name": string, 
    "filter_allowed_values": [string],
    "blowup_srcA_col_name": string, 
    "blowup_srcB_col_name": string
}

export interface TreeCon extends Transformation {
    "sourceA" : string,
    "sourceB" : string,
    "sourceResult" : string  
}

export interface Group extends Transformation {
    "source" : string,
    "sourceResult" : string,      
    "group_columns": 
    [
        {
            "col_nr": number, 
            "name":string,
            "group_mode": string 
        }
    ]
}

export interface Order extends Transformation {
    "source" : string,
    "sourceResult" : string,    
    "order_columns": OrderCondition[]    
}

export class OrderCondition {
    col_nr : number;
    name : string;
    order_mode : string;
}

export interface ProjectCondition {
    col_nr : number,
    name : string
}

export interface GroupCondition extends ProjectCondition{
    group_mode : string
}

export interface JoinCondition {
    srcA : {
        col_name : string,
        col_nr : number
    },
    srcB : {
        col_name : string,
        col_nr : number
    },
    operation : string    
}

export class RelationalTransform {
    doTransformation( source : DataSource, trans : TransformationType ) : string {
        if( trans.type == "JOIN_FULL_TABLE_SCAN" ) {
            return this.join(source, trans as Join);
        }
        if( trans.type == "GROUP" ) {
            return this.group(source, trans as Group);
        }
        if( trans.type == "ORDER" ) {
            return this.order(source, trans as Order);
        }
        if( trans.type == "BLOWUP" ) {
            return this.blowup(source, trans as Blowup);
        }
        if( trans.type == "TREECON" ) {
            return this.treeCon(source, trans as Blowup);
        }
        throw new Error("Unknown transformation found " + trans.name + " " + trans.type);
        
    }

    transformationError( condition, trans, errText) {
        if( condition ) throw new Error("Error in transformation " + trans.type + " [" + trans.name + "]" + ": " + errText);
    }

    treeCon( source : DataSource, trans : Blowup ) : string {
        console.log("TreeCon-Transformation");

        this.transformationError( trans.sourceResult == undefined, trans, "sourceResult is empty");
        this.transformationError( source.getTable(trans.sourceA) == undefined, trans, "Table " + trans.sourceA + " not found");
        this.transformationError( source.getTable(trans.sourceB) == undefined, trans, "Table " + trans.sourceB + " not found");

        return trans.sourceA;
    }

    blowup( source : DataSource, trans : Blowup ) : string {
        console.log("Blowup-Transformation");

        this.transformationError( trans.sourceResult == undefined, trans, "sourceResult is empty");
        this.transformationError( source.getTable(trans.sourceA) == undefined, trans, "Table " + trans.sourceA + " not found");
        this.transformationError( source.getTable(trans.sourceB) == undefined, trans, "Table " + trans.sourceB + " not found");

        this.transformationError( source.getTable(trans.sourceA).columns.find(x => x.name == trans.blowup_srcA_col_name) == undefined, trans, "Column " + trans.blowup_srcA_col_name + " not found in table " + trans.sourceA );
        this.transformationError( source.getTable(trans.sourceB).columns.find(x => x.name == trans.blowup_srcB_col_name) == undefined, trans, "Column " + trans.blowup_srcB_col_name + " not found in table " + trans.sourceB );

        for( let inx = 0 ; inx < source.getTable(trans.sourceA).rows.length ; inx++ )
        {
            if( 
                    source.getTable(trans.sourceA).getColMetaData[inx] != undefined && 
                    source.getTable(trans.sourceA).getColMetaData[inx].blowup != undefined &&
                    source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_COLUMN != undefined &&
                    source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_TARGET_COLUMN != undefined
                ) {
                let col_nr_A = source.getTable(trans.sourceA).columns.find(x => x.name == source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_COLUMN).col_nr;
                let col_nr_B = source.getTable(trans.sourceB).columns.find(x => x.name == source.getTable(trans.sourceA).getColMetaData[inx].blowup.BLOWUP_TARGET_COLUMN).col_nr;
                source.getTable(trans.sourceA).getColMetaData[inx].blowup.setBlowupColumns(col_nr_A,col_nr_B);
            }
        }

        return source.addTable(this.blowup_intern(source.getTable(trans.sourceA), source.getTable(trans.sourceB), trans.sourceResult ));
    }

    blowup_intern( data_basis: Table, data_dimension: Table, result_table_name: string ) : Table {
        console.log("Blowup-Transformation intern");

        let result  = new Table(result_table_name, data_basis.columns); 

        for( let inx = 0 ; inx < data_basis.rows.length ; inx++)
        {
            let row = data_basis.rows[inx];
            //row for blowing up is marked with "BLOWUP" as content
            if( 
                data_basis.getColMetaData[inx] != undefined && 
                data_basis.getColMetaData[inx].blowup != undefined && 
                data_basis.getColMetaData[inx].blowup.BLOWUP_basis_col != undefined && 
                data_basis.getColMetaData[inx].blowup.BLOWUP_dim_col != undefined ) {
                //console.log(data_basis.meta_data[inx].toText());
                for( let rowdim of data_dimension.rows ) {

                    let new_row : Row = new Row();          
                    //copy row and replace one column         
                    for( let a = 0 ; a < row.row.length ; a++ ) {
                        if( a == data_basis.getColMetaData[inx].blowup.BLOWUP_basis_col ) {
                            new_row.row.push(rowdim.row[data_basis.getColMetaData[inx].blowup.BLOWUP_dim_col]);
                        }
                        else
                        {
                            new_row.row.push(row.row[a]);
                        }
                    }
                
                    result.rows.push(new_row);
                }
            }
            //plain copy any other row
            else
            {
                result.rows.push(row);
            }
        }

        return result;
    }

    join( source : DataSource, join : Join ) : string {
        for( let cond of join.join_conditions) {
            cond.srcA.col_nr = source.getTable(join.sourceA).columns.find(x => x.name == cond.srcA.col_name).col_nr;
            cond.srcB.col_nr = source.getTable(join.sourceB).columns.find(x => x.name == cond.srcB.col_name).col_nr;
        }

        console.log(join.name + " [" + join.type + "]");
        console.log(join.sourceA + " + " + join.sourceB + " -> " + join.sourceResult);
        for( let cond of join.join_conditions ) {
            console.log( cond.srcA.col_name + " (" + cond.srcA.col_nr + ")" + " " + cond.operation + " " + cond.srcB.col_name + " (" + cond.srcB.col_nr + ")" )
        }        
        console.log("");

        let result : Table = this.join_intern(join.sourceResult,source.getTable(join.sourceA),source.getTable(join.sourceB),join.join_conditions);
        console.log( result.toText());

        return source.addTable(result);
    }

    order( source : DataSource, order : Order ) : string {
        let result : Table = this.order_intern(order.sourceResult,source.getTable(order.source),order.order_columns);
        console.log( result.toText());

        return source.addTable(result);
    }

    order_intern( name : string, data : Table, orderCond : OrderCondition[]) : Table {   
        let res_columns : Column[] = data.columns;
        let result  = new Table(name, res_columns);  

        var sortedArray: Row[] = data.rows.sort((n1,n2) => {
            for( let oc of orderCond ) {
                if (n1.row[oc.col_nr] > n2.row[oc.col_nr]) {
                    if( oc.order_mode == "ASC" )
                        return 1;
                    else 
                        return -1
                }
            
                if (n1.row[oc.col_nr] < n2.row[oc.col_nr]) {
                    if( oc.order_mode == "ASC" )
                        return -1;
                    else    
                        return 1;
                }
            }

            return 0;            
        });

        result.rows=sortedArray;

        return result;
    }

    group( source : DataSource, group : Group ) : string {
        console.log(group.name + " [" + group.type + "]");
        console.log(group.source + " -> " + group.sourceResult);
        for( let grp of group.group_columns ) {
            console.log( grp.name + " (" + grp.col_nr + ")" + " " + grp.group_mode );
        }        
        console.log("");
        
        return source.addTable(this.group_intern(group.sourceResult,source.getTable(group.source),group.group_columns)); 
    }

    project_intern( name : string, data : Table, prjCond : ProjectCondition[]) : Table {   
        let res_columns : Column[] = [];
        let keep_cols : number[] = [];

        for( let col of data.columns) {
            for( let grpCol of prjCond) {
                if( col.col_nr == grpCol.col_nr) {
                    res_columns.push(col);
                    keep_cols.push(col.col_nr)
                }
            }
        }
        let result  = new Table(name, res_columns);        
        result.rows = [];

        for( let row of data.rows) {             
            let r : Row = new Row();                   
            for( let keep_col_inx of keep_cols) {
                r.row.push(row.row[keep_col_inx]);
            }
            result.rows.push(r);
        }

        return result;        
    }

    group_intern( name : string, data : Table, grpCond : GroupCondition[]) : Table {   
        let result : Table = data;
        let keys : any[] = []; //Liste der Spaltennummern der Group-Spalten
        let aggs : number[] = []; //Liste der Spaltennummern der Agg-Spalten
        let orderCond : OrderCondition[] = [];
        for( let gc of grpCond ) {
            if( gc.group_mode == "key" ) {
                let oc : OrderCondition = new OrderCondition();
                oc.col_nr=gc.col_nr;
                oc.name=gc.name;
                oc.order_mode='ASC';
                orderCond.push(oc);
                keys.push(oc.col_nr);
            }
            else aggs.push(gc.col_nr);
        }

        result = this.order_intern(name, result, orderCond);
        //console.log(result.toText());   
        
        let groupResult : Table = new Table(name,result.columns);
        groupResult.rows = new Array<Row>();

        let lastKeys : any[] = []; //letzter Zustand der Group-Spalten
        let lastRow : Row;
        let sum = new Array<number>(result.columns.length); //summiert alle agg-Spalten        
        let count : number = 0;
        let newGrp : boolean = false;
        let first : boolean = true;
            
        for( let a = 0 ; a < sum.length ; a++ ) {
            sum[a] = 0;
        }                                

        for( let r of result.rows ) {
            for( let k of keys) {
                //neue Group-Spalten-Einträge -> neue Gruppe
                if( lastKeys[k] != r.row[k]) {
                    lastKeys[k] = r.row[k];
                    if( ! first) newGrp = true;
                }
            }                
            if( newGrp ) {
                let newRow : Row = lastRow;
                for( let a of aggs) {
                    newRow.row[a] = sum[a];
                }                  
                //console.log( "new Row: " + sum + " " + count + " - " + newRow.row );
                groupResult.rows.push(newRow);

                for( let a of aggs) {
                    sum[a] = 0;
                }                                
                count = 1;
                newGrp = false;
            }
            for( let a of aggs) {
                sum[a] += r.row[a];
            }                            
            lastRow = r;
            first = false;
        }
        let newRow : Row = lastRow;
        for( let a of aggs) {
            newRow.row[a] = sum[a];
        }                  
        //console.log( "new Row: " + sum + " " + count + " - " + newRow.row );
        groupResult.rows.push(newRow);
        console.log( groupResult.toText());   

        result = this.project_intern(name,groupResult,grpCond as ProjectCondition[]);

        return result;
    }

    join_intern( name : string, dataA : Table, dataB : Table, joinCond : JoinCondition[]) : Table {        
        let res_columns : Column[] = [];
        let nr : number = 0;
        for( let col of dataA.columns) {
            let c : Column = { "col_nr": nr, "name": dataA.name + ":" + col.name};
            res_columns.push(c);
            nr++;
        }        
        for( let col of dataB.columns) {
            let c : Column = { "col_nr": nr, "name": dataB.name + ":" + col.name };
            res_columns.push(c);
            nr++;
        }
        let result  = new Table(name, res_columns);        

        for( let rowA of dataA.rows) {
            for( let rowB of dataB.rows) {
                if( this.checkCondition(joinCond,rowA,rowB) ) {
                    let r : Row = new Row();
                    for( let value of rowA.row) {
                       r.row.push(value);
                    }
                    for( let value of rowB.row) {
                       r.row.push(value);
                    }
                    
                    result.rows.push(r);
                }
            }
        }

        return result;
    }

    checkCondition( conditions : JoinCondition[], row_A : Row, row_B : Row ) : boolean {
        for( let key of conditions) {            
            if( row_A.row[key.srcA.col_nr] == row_B.row[key.srcB.col_nr])  {
                //console.log("checking " + key.srcA.col_nr + "/" + key.srcB.col_nr + " : " + row_A.row[key.srcA.col_nr] + "/" + row_B.row[key.srcB.col_nr] + "-> true");                
            } else {
                //console.log("checking " + key.srcA.col_nr + "/" + key.srcB.col_nr + " : " + row_A.row[key.srcA.col_nr] + "/" + row_B.row[key.srcB.col_nr] + "-> false");
                return false;
            }
        }

        return true;
    }

    checkConditionExpression( condition : (row_A : Row, row_B : Row) => boolean, row_A : Row, row_B : Row ) : boolean {
        let result : boolean = condition(row_A, row_B);
        if( result )  {
            console.log("checking -> true");                
            return true;
        } else {
            console.log("checking -> false");
            return false;
        }
    }
}
