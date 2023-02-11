import { Dataset } from './Dataset';

export class Column {
    col_nr : number;
    name : string;
    constructor(col_nr : number, name : string ) {
        this.col_nr=col_nr;
        this.name=name;
    }

}

export class Row {
    row : Array<any>;
    constructor() {
        this.row = new Array<any>();
    }
}

export class Table {

    name : string;   
    columns : Column[];
    rows : Array<Row>;

    constructor( name : string, columns :  Column[] ) {
        this.name = name;
        this.rows = new Array<Row>();
        this.columns = columns;
    }

    setData( data : Dataset ) : Table
    {        
        this.rows = new Array<Row>();
        for( let row of data.rows) {                        
             let r : Row = new Row();
             r.row = row;
             this.rows.push(r);
        }
        return this;
    }

    toText(): string {
        let text : string;
        text = this.name + ':\n';
        for( let col of this.columns) {
            text += col.name + '\t'
        }
        text += '\n'
        
        if( this.rows.length > 0 ) {
            for( let row of this.rows) {
                for( let value of row.row ) {
                    text += value + '\t';
                }
                text += '\n'
            }
        } else {
            text += '(no data)'    
        }
        text += '\n'

        return text;
    };

}