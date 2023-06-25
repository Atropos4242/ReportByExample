export class TableMetaData {
    blowup?: TableMetaDataBlowup;
    treeCon?: TableMetaDataTreeCon;

    constructor(md: any) {
        this.blowup = new TableMetaDataBlowup();
        this.treeCon = new TableMetaDataTreeCon();

        if( md.BLOWUP_COLUMN != undefined )
            this.blowup.BLOWUP_COLUMN=md.BLOWUP_COLUMN;    
            
        if( md.BLOWUP_TARGET_COLUMN != undefined )
            this.blowup.BLOWUP_TARGET_COLUMN=md.BLOWUP_TARGET_COLUMN;   
    }

    toText() : string {
        return "META_DATA=" + JSON.stringify(this);
    }
}
export class TableMetaDataTreeCon {
    AGG_COL: string;
    COL_FLT: [{ "FLT_COL": string, "FLT_VALUE": string }];
}


export class TableMetaDataBlowup {
    BLOWUP_COLUMN?: string;
    BLOWUP_TARGET_COLUMN?: string;
    BLOWUP_basis_col?: number;
    BLOWUP_dim_col?: number;

    setBlowupColumns( basis_col: number, dim_col: number ) {
        this.BLOWUP_basis_col=basis_col;
        this.BLOWUP_dim_col=dim_col;
    }
}