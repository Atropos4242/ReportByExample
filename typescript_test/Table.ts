import { Dataset } from './Dataset';

export interface Column {
    col_nr : number;
    name : string;
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
    url: string;

    constructor( name : string, columns :  Column[], url: string ) {
        this.name = name;
        this.rows = new Array<Row>();
        this.columns = columns;
        this.url = url;
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

    setDataNotPlain( data : any ) : Table
    {        
        //console.log(data.length);
        this.rows = new Array<Row>();
        for( let row of data) {            
            //console.log(row);            
            let r : Row = new Row();
            for (const key of Object.keys(row)) {
                r.row.push(row[key]);
            }  
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
    }

    definitionToText(): string {
        let text : string;
        text = this.name + ':\n';
        let max_col_len : number = 0;
        for( let col of this.columns) {
            if( col.name.length > max_col_len ) {
                max_col_len = col.name.length
            }
        }
        let col_name_max_width : string = "                                                             ";
        
        text += ("Index "+ col_name_max_width).substring(0,5+3)
        text += ("Column "+ col_name_max_width).substring(0,max_col_len+3)
        text += "Example"
        text += "\n"
        for( let i = 0 ; i < this.columns.length ; i++ ) {
            text += (i + col_name_max_width).substring(0,5+3);
            text += (this.columns[i].name + col_name_max_width).substring(0,max_col_len+3);
            if( this.rows.length > 0 ) text += this.rows[0].row[i];
            text += "\n";
        }
        text += '\n';
        
        if( this.rows.length == 0 ) {
            text += '(no data)'    
        }
        text += '\n';

        return text;
    }

}