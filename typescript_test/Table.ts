import { Dataset } from './Dataset';
import { ColumnType, TableMetaDataType } from './TableDataStructures';

// export interface Column {
//     col_nr : number;
//     name : string;
//     columnMetaData?: TableMetaData;
// }

export class Row {
    row : Array<any>;
    rowMetaData?: TableMetaDataType;

    constructor() {
        this.row = new Array<any>();
    }
}

export class Table {

    name : string;   
    columns : ColumnType[];
    rows : Array<Row>;
    url: string;

    colNameNumber: Map<string,number>;

    constructor( name : string, columns :  ColumnType[], url?: string ) {
        this.name = name;
        this.rows = new Array<Row>();
        this.columns = columns;
        this.url = url;
        this.colNameNumber = new Map<string,number>;
    }

    getRowMetaData( index: number ) : TableMetaDataType {
        return this.rows[index].rowMetaData;
    }

    setRowMetaData( index: number, md: TableMetaDataType ) {
        this.rows[index].rowMetaData = md;
    }

    getColMetaData( index: number ) : TableMetaDataType {
        return this.columns[index].columnMetaData;
    }

    setColMetaData( index: number, md: TableMetaDataType ) {
        this.columns[index].columnMetaData = md;
    }

    getColNumberByName( name: string ) : number {
        if( this.colNameNumber.get(name) != undefined ) return this.colNameNumber.get(name);

        //console.log( "No cache hit: " + name + " in " + this.name);

        if( name == undefined ) throw Error("Colummn " + name + " not found in " + this.name );

        for( let i = 0 ; i < this.columns.length ; i++ )
        {
            if( this.columns[i].name.toLocaleLowerCase() == name.toLowerCase() ) {
                this.colNameNumber.set(name,i);
                return i;
            }
        }
        this.colNameNumber.set(name,-1);
        throw Error("Colummn " + name + " not found in " + this.name );
        return -1;
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
            for (const key of Object.keys(row)) {
                if( key != "__META_DATA")
                    r.row[this.getColNumberByName(key)]=row[key];
                else
                    r.rowMetaData = row[key] as TableMetaDataType;
            }  
            this.rows.push(r);
        }
        return this;
    }

    toText( excludeMetaData: boolean ): string {
        let text : string;
        text = this.name + ':\n';
        for( let col of this.columns) {
            text += col.name + '\t'
        }
        text += '\n'
        
        if( this.rows.length > 0 ) {
            for( let inx = 0 ; inx < this.rows.length && inx < 50; inx++ ) {
                let row = this.rows[inx];
                for( let value of row.row ) {
                    text += value + '\t';
                }
                if( ! excludeMetaData )
                    text += row.rowMetaData != undefined ? " | " + JSON.stringify(row.rowMetaData) : "";
                text += '\n'
            }
            text += 'count=' + this.rows.length + '\n'
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