import { Table, Column, Row } from './Table';
import { JoinCondition, Join, Group, RelationalTransform } from './Transformation';

export class DataSource {
    sources :  Map<string,Table>;
    transformations : Map<string,Join|Group>;

    relTransformations = new RelationalTransform();

    constructor(tables : TableDataStructures ) {
        this.sources = new Map<string, Table>();
        for( let t of tables.tableDataStructures) {
            this.addTable(new Table(t.name, t.columns))
        }

        this.transformations = new Map<string, Join|Group>();
        for( let t of tables.transformations) {
            this.transformations.set(t.name, t);
        }
    }

    addTable( table : Table ) : string {
        this.sources.set(table.name,table);
        return table.name;
    }

    getTable( name : string ) : Table{
        return this.sources.get(name);
    }

    doAllTransformations() {
        let result_table : string = "none";
        for( let t of this.transformations.keys()) {
            result_table= this.relTransformations.doTransformation(this, this.transformations.get(t));
        }
        return result_table;
    }

    doScriptedTransformnations() : string {
        let result_table : string = "none";
        return result_table;       
    }
}

export interface TableDataStructures {
    tableDataStructures:
    [
        {
            name : string,   
            columns : [
                {
                    col_nr : number;
                    name : string;
                }
            ]
        }
    ],
    transformations: [Join|Group]
}

