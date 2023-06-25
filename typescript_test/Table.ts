import { Dataset } from './Dataset';
import { TableMetaData } from './TableMetaData';

export interface Column {
    col_nr : number;
    name : string;
    columnMetaData?: TableMetaData;
}

export class Row {
    row : Array<any>;
    rowMetaData?: TableMetaData;

    constructor() {
        this.row = new Array<any>();
    }
}

export class Table {

    name : string;   
    columns : Column[];
    rows : Array<Row>;
    url: string;
    //meta_data : Array<TableMetaData>;

    constructor( name : string, columns :  Column[], url?: string ) {
        this.name = name;
        this.rows = new Array<Row>();
        this.columns = columns;
        this.url = url;
        //this.meta_data = new Array<TableMetaData>();
    }

    getRowMetaData( index: number ) : TableMetaData {
        return this.rows[index].rowMetaData;
    }

    setRowMetaData( index: number, md: TableMetaData ) {
        this.rows[index].rowMetaData = md;
    }

    getColMetaData( index: number ) : TableMetaData {
        return this.columns[index].columnMetaData;
    }

    setColMetaData( index: number, md: TableMetaData ) {
        this.columns[index].columnMetaData = md;
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
        //this.meta_data = new Array<TableMetaData>();
        for( let row of data) {            
            //console.log(row);            
            let r : Row = new Row();
            let m : TableMetaData;
            for (const key of Object.keys(row)) {
                if( key != "__META_DATA")
                    r.row.push(row[key]);
                else
                {
                    r.rowMetaData = new TableMetaData(row[key]);
                }
            }  
            this.rows.push(r);
            //this.meta_data.push(m);
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
            for( let inx = 0 ; inx < this.rows.length; inx++ ) {
                let row = this.rows[inx];
                for( let value of row.row ) {
                    text += value + '\t';
                }
                text += this.getRowMetaData[inx] != undefined ? " | " + (this.getRowMetaData[inx]).toText() : "";
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
        text += "MetaData"
        text += "\n"
        for( let i = 0 ; i < this.columns.length ; i++ ) {
            text += (i + col_name_max_width).substring(0,5+3);
            text += (this.columns[i].name + col_name_max_width).substring(0,max_col_len+3);
            if( this.rows.length > 0 ) text += this.rows[0].row[i];
            text += (this.columns[i].columnMetaData != undefined ? JSON.stringify(this.columns[i].columnMetaData) : "")
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