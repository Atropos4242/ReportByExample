import { Table, Column, Row } from './Table';
import { JoinCondition, Join, Group, RelationalTransform } from './Transformation';

export class DataSource {
    sources :  Map<string,Table>;
    transformations : Map<string,Join|Group>;

    relTransformations = new RelationalTransform();

    constructor(tables : TableDataStructures ) {
        this.sources = new Map<string, Table>();
        for( let t of tables.tableDataStructures) {
            this.addTable(new Table(t.name, t.columns, t.url))
        }

        this.transformations = new Map<string, Join|Group>();
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

    doAllTransformations() {
        let result_table : string = "none";
        for( let t of this.transformations.keys()) {
            result_table= this.relTransformations.doTransformation(this, this.transformations.get(t));
        }
        return result_table;
    }

    doScriptedTransformnations() : string {
        let result_table : string = "none";
        return result_table;       
    }

    gatherAllData(callback) {
        let start = performance.now();

        let remoteSources = Array.from(this.sources.keys()).filter(key => this.sources.get(key).url != undefined);

        var requests = remoteSources.map((key: string) => {     
            console.log(`Fetching ${key}...`);

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
                    console.log("Result " + i + ": " + remoteSources[i] + " with length " + results[i].length);
                    this.getTable(remoteSources[i]).setDataNotPlain(results[i]);
                }
                else
                {
                    console.log("Error while fetching " + remoteSources[i]);
                    console.log(results[i]);
                }
            }
            callback();
        }).catch(err => {
            console.log(`Error while fetching {key}`);
            console.log(err);
        });
    }
}

export interface TableDataStructures {
    tableDataStructures:
    [
        {
            name : string,   
            columns : [
                {
                    col_nr : number;
                    name : string;
                }
            ],
            url? : string
        }
    ],
    transformations: [Join|Group]
}

