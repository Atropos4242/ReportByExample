import { TableMetaDataTransformBlowupType, TableMetaDataTransformTreeConType, TableMetaDataType } from "./TableDataStructures";

export class TableMetaData {
    colMetaData: Map<number,Map<string,TableMetaDataType>>;
    rowMetaData: Map<number,Map<string,TableMetaDataType>>;

    constructor() {
        this.colMetaData = new Map<number,Map<string,TableMetaDataType>>;
        this.rowMetaData = new Map<number,Map<string,TableMetaDataType>>;
    }

    addColMetaData( col_nr:number, cmd: TableMetaDataType) {
        if( this.colMetaData.get(col_nr) == undefined ) {
            this.colMetaData.set(col_nr, new Map<string, TableMetaDataType>);
        }

        this.colMetaData.get( col_nr).set(cmd.TRANS_NAME, cmd );
    }

    addRowMetaData( col_nr:number, cmd: TableMetaDataType) {
        if( this.rowMetaData.get(col_nr) == undefined ) {
            this.rowMetaData.set(col_nr, new Map<string, TableMetaDataType>);
        }

        this.rowMetaData.get( col_nr).set(cmd.TRANS_NAME, cmd );
    }

    getColMetaData( col_nr:number, transName: string ) : TableMetaDataType {
        return this.colMetaData.get(col_nr)?.get(transName);
    }

    getColBlowupMetaData( col_nr:number, transName: string ) : TableMetaDataTransformBlowupType {
        if( this.getColMetaData(col_nr, transName) != undefined )
            return this.getColMetaData(col_nr, transName) as TableMetaDataTransformBlowupType;
    }

    getColTreeConMetaData( col_nr:number, transName: string ) : TableMetaDataTransformTreeConType {
        if( this.getColMetaData(col_nr, transName) != undefined )
            return this.getColMetaData(col_nr, transName) as TableMetaDataTransformTreeConType;
    }

    getRowMetaData( row_nr:number, transName: string ) : TableMetaDataType {
        return this.rowMetaData.get(row_nr)?.get(transName);
    }

    getAllRowMetaData( row_nr:number ) : any[] {
        let result: TableMetaDataType[] = [];
        if( this.rowMetaData.get(row_nr) != undefined ) {
            for( const k of this.rowMetaData.get(row_nr).keys() ) {
                result.push( this.rowMetaData.get(row_nr).get(k));
            }
        }
        return result;
    }

    getRowBlowupMetaData( row_nr:number, transName: string ) : TableMetaDataTransformBlowupType {
        if( this.getRowMetaData(row_nr, transName) != undefined )
            return this.getRowMetaData(row_nr, transName) as TableMetaDataTransformBlowupType;
    }

    getRowTreeConMetaData( row_nr:number, transName: string ) : TableMetaDataTransformTreeConType {
        if( this.getRowMetaData(row_nr, transName) != undefined )
            return this.getRowMetaData(row_nr, transName) as TableMetaDataTransformTreeConType;
    }

    toText() : string {
        return "META_DATA=" + JSON.stringify(this);
    }
}