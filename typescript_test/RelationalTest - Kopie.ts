import { Dataset } from './Dataset';
import { DataSource, TableDataStructures } from './DataSource';

import tableDataStructure from './TableDataStructures.json';
import dataA from './Data_Set_A.json';
import dataB from './Data_Set_B_large.json';

function runScript() {
    const start = performance.now();

    let source = new DataSource(tableDataStructure as TableDataStructures);

    source.getTable("T.Modell").setData(dataA as Dataset);
    //console.log(source.getTable("T.Modell").toText());

    source.getTable("T.Anzahl").setData(dataB as Dataset);
    //console.log(source.getTable("T.Anzahl").toText());

    console.log(source.getTable(source.doAllTransformations()).toText());

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
}

function runJSVersion() {
    const start = performance.now();
    let source = new DataSource(tableDataStructure as TableDataStructures);

    source.getTable("T.Modell").setData(dataA as Dataset);
    source.getTable("T.Anzahl").setData(dataB as Dataset);

    console.log(source.getTable(source.doScriptedTransformnations()).toText());

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
}

runJSVersion();
//console.log(eval("end - start"));

