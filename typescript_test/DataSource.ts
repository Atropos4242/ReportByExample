import { Table, Column, Row } from './Table';
import { JoinCondition, Join, Group, RelationalTransform, Blowup } from './Transformation';
import { TransformationType } from './Transformation';
import { TableMetaData } from './TableMetaData';
import { TableDataStructures } from './TableDataStructures';

export class DataSource {
    sources :  Map<string,Table>;
    transformations : Map<string,TransformationType>;

    relTransformations = new RelationalTransform();

    constructor(tables : TableDataStructures ) {
        this.sources = new Map<string, Table>();
        for( let t of tables.tableDataStructures) {
            this.addTable(new Table(t.name, t.columns, t.url))
        }

        this.transformations = new Map<string, TransformationType>();
        for( let t of tables.transformations) {
            this.transformations.set(t.name, t);
        }
    }

    addTable( table : Table ) : string {
        this.sources.set(table.name,table);
        return table.name;
    }

    getTable( name : string ) : Table{
        return this.sources.get(name);
    }

    runTransformations() {
        console.log("Running Transformations now...");
        const start = performance.now();

        let resultTableName : string = "none";
        for( let t of this.transformations.keys()) {
            resultTableName= this.relTransformations.doTransformation(this, this.transformations.get(t));
        }

        if( this.getTable(resultTableName) != undefined )
            console.log(this.getTable(resultTableName).toText());
        else
            console.log("No result table returned");

        const end = performance.now();
        console.log(`Execution time: ${end - start} ms`);
    }

    gatherAllDataAndRunTransformations(localDataCallback) {
        let start = performance.now();

        localDataCallback();

        let remoteSources = Array.from(this.sources.keys()).filter(key => this.sources.get(key).url != undefined);

        var requests = remoteSources.map((key: string) => {     
            //console.log(`Fetching ${key}...`);

            let fetchPromise: Promise<Response> = fetch(this.sources.get(key).url);

            return fetchPromise.then(response => {
                return response.json();
            })
            .catch(err => {
                console.log(`Error while fetching ${key}`);
                console.log(err);
            });
        });

        // Resolve all the fetch-promises
        Promise.all(requests)
        .then((results) => {
            console.log("Created remote Datasets " + `after ${performance.now() - start} ms`);
            for( let i = 0; i < results.length ; i++ ){
                //console.log(results[i]);
                if( results[i].status == undefined ) {
                    //console.log("Result " + i + ": " + remoteSources[i] + " with length " + results[i].length);
                    this.getTable(remoteSources[i]).setDataNotPlain(results[i]);
                }
                else
                {
                    console.log("Error while fetching " + remoteSources[i]);
                    console.log(results[i]);
                }
            }
            Array.from(this.sources.keys()).forEach((key: string) => { console.log("Source " + key + ": " + (this.getTable(key).url == undefined ? "local" : "remote") + " length " + this.getTable(key).rows.length); })
            this.runTransformations();
        }).catch(err => {
            console.log(`Error while fetching`);
            console.log(err);
        });
    }
}
