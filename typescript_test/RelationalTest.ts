import { Dataset } from './Dataset';
import { DataSource, TableDataStructure } from './DataSource';
import dataA from './Data_Set_A.json';
import dataB from './Data_Set_B_large.json';
import { GroupColumn, Join, OrderCondition } from './Transformation';
import { Row, Column } from './Table';


let source = new DataSource(
    [
        new TableDataStructure("T.Modell", 
        [
            new Column(0, "MODELL"), 
            new Column(1, "BEZEICHNUNG"), 
        ]),
        new TableDataStructure("T.Anzahl", 
        [
            new Column(0, "PARTNER"), 
            new Column(1, "MODELL"), 
            new Column(2, "ANZAHL"), 
        ]),
        new TableDataStructure("T.Result", 
        [
            new Column(0, "PARTNER"), 
            new Column(1, "MODELL"), 
            new Column(2, "BEZEICHUNG"), 
            new Column(3, "ANZAHL"), 
        ])                
    ]
);

source.getTable("T.Modell").setData(dataA as Dataset);
source.getTable("T.Anzahl").setData(dataB as Dataset);

class Modell_Row extends Row {
    getModell() : any { return this.row[0]; };
    getBezeichung() : any { return this.row[1]; };
}

class Anzahl_Row extends Row {
    getPartner() : any { return this.row[0]; };
    getModell() : any { return this.row[1]; };
    getAnzahl() : any { return this.row[2]; };
}

source.doScriptedTransformnations(
    [
        new Join( "T.Modell", "T.Anzahl", ( row_A : Row, row_B : Row ) : boolean => 
            { return (row_A as Modell_Row ).getModell() == (row_B as Anzahl_Row).getModell(); })
    ],
    [
        new GroupColumn(0, "MODELL", "key"),
        new GroupColumn(1, "BEZEICHNUNG", "key"),
        new GroupColumn(4, "ANZAHL", "sum")
    ],
    [
        new OrderCondition(2,"T.Anzahl:ANZAHL","DESC")
    ]
);



