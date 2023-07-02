import { Dataset } from './Dataset';
import { ColumnType, TableMetaDataType } from './TableDataStructures';
import { TableMetaData } from './TableMetaData';

export class Row {
    row : Array<any>;
    //rowMetaData?: TableMetaDataType;
    marked: string;

    constructor() {
        this.row = new Array<any>();
    }
}

export class Table {

    name : string;   
    columns : ColumnType[];
    rows : Array<Row>;
    url: string;

    colNameNumberCache: Map<string,number>;
    metaDataCache: TableMetaData;
    markLine: Map<string, Row>;

    constructor( name : string, columns :  ColumnType[], url?: string ) {
        this.name = name;
        this.rows = new Array<Row>();
        this.columns = columns;
        this.url = url;
        this.colNameNumberCache = new Map<string,number>;
        this.metaDataCache = new TableMetaData();
        this.markLine = new Map<string, Row>;

        for( let c = 0 ; c < columns.length ; c++ ) {
            if( columns[c].columnMetaData != undefined ) {
                for( let m = 0 ; m < columns[c].columnMetaData.length ; m++ ) {
                    this.metaDataCache.addColMetaData(c, columns[c].columnMetaData[m] );
                }
            }
        }
    }

    getMetaData() : TableMetaData {
        return this.metaDataCache;
    }

    getColNumberByName( name: string ) : number {
        if( this.colNameNumberCache.get(name) != undefined ) return this.colNameNumberCache.get(name);

        //console.log( "No cache hit getColNumberByName: " + name + " in " + this.name);

        if( name == undefined ) throw Error("Colummn " + name + " not found in " + this.name );

        for( let i = 0 ; i < this.columns.length ; i++ )
        {
            if( this.columns[i].name.toLocaleLowerCase() == name.toLowerCase() ) {
                this.colNameNumberCache.set(name,i);
                return i;
            }
        }
        this.colNameNumberCache.set(name,-1);
        throw Error("Colummn " + name + " not found in " + this.name );
        return -1;
    }

    addMarkedLine( line: Row, marker: string ) {
        this.markLine.set( marker, line );
        line.marked=marker;
        this.rows.push(line);
    }

    getMarkedLine( marker: string ) {
        return this.markLine.get(marker);
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
        for( let row_inx = 0 ; row_inx < data.length; row_inx++ ) {        
            //console.log(row);            
            let r : Row = new Row();
            for (const key of Object.keys(data[row_inx])) {
                if( key != "__META_DATA") {
                    r.row[this.getColNumberByName(key)]=data[row_inx][key];
                } else {
                    //r.rowMetaData = row[key] as TableMetaDataType;
                    let md: TableMetaDataType[] = data[row_inx][key];
                    for( let m = 0 ; m < md.length ; m++ ) {
                        let tmd: TableMetaDataType = {...md[m]};
                        this.metaDataCache.addRowMetaData(row_inx,tmd);
                    }
                }
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
            for( let inx = 0 ; inx < this.rows.length && inx < 100; inx++ ) {
                let row = this.rows[inx];
                for( let value of row.row ) {
                    text += value + '\t';
                }
                if( ! excludeMetaData ) {
                    text += row.marked != undefined ? " | " + row.marked : "";
                    text += this.getMetaData().getAllRowMetaData( inx ) != undefined ? " | " + JSON.stringify(this.getMetaData().getAllRowMetaData( inx )) : "";
                }
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