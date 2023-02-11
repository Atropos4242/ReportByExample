import { Table, Column, Row } from './Table';
import { Join, GroupColumn, RelationalTransform, OrderCondition } from './Transformation';

export class DataSource {
    sources :  Map<string,Table>;
    relTransformations = new RelationalTransform();

    constructor(table_structures : TableDataStructure[] ) {
        this.sources = new Map<string, Table>();
        for( let t of table_structures) {
            this.addTable(new Table(t.name, t.columns))
        }
    }

    addTable( table : Table ) : string {
        this.sources.set(table.name,table);
        return table.name;
    }

    getTable( name : string ) : Table{
        return this.sources.get(name);
    }

    doScriptedTransformnations( joins : Join[], group : GroupColumn[], order : OrderCondition[] ) : string {
        const start = performance.now();

        let result_table : string = "none";
        let nr : number = 1;
        for( let j of joins ) {
            result_table = this.relTransformations.join( this, "J" + nr, j );   
        }
        result_table = this.relTransformations.group( this, "G", this.getTable(result_table), group );   
        result_table = this.relTransformations.order( this, "O", this.getTable(result_table), order );   

        const end = performance.now();
        console.log(`Execution time: ${end - start} ms`);

        console.log(this.getTable(result_table).toText());

        return result_table;
    }
}

export class TableDataStructure {
    name : string;
    columns : Column[];

    constructor(name : string, columns : Column[])  {
        this.name=name;
        this.columns=columns;
    }
}

