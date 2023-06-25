export class TableMetaData {
    BLOWUP_COLUMN?: string;
    BLOWUP_TARGET_COLUMN?: string;
    BLOWUP_basis_col?: number;
    BLOWUP_dim_col?: number;

    constructor(md: any) {
        if( md.BLOWUP_COLUMN != undefined )
            this.BLOWUP_COLUMN=md.BLOWUP_COLUMN;    
            
        if( md.BLOWUP_TARGET_COLUMN != undefined )
            this.BLOWUP_TARGET_COLUMN=md.BLOWUP_TARGET_COLUMN;   
    }

    setBlowupColumns( basis_col: number, dim_col: number ) {
        this.BLOWUP_basis_col=basis_col;
        this.BLOWUP_dim_col=dim_col;
    }

    toText() : string {
        //return "META_DATA={ " + (this.BLOWUP != undefined ? "BLOWUP: " + this.BLOWUP +  : "") + " }";
        return "META_DATA=" + JSON.stringify(this);
    }
}