"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSource = void 0;
const Table_1 = require("./Table");
const Transformation_1 = require("./Transformation");
class DataSource {
    constructor(tables) {
        this.relTransformations = new Transformation_1.RelationalTransform();
        this.sources = new Map();
        for (let t of tables.tableDataStructures) {
            this.addTable(new Table_1.Table(t.name, t.columns, t.url));
        }
        this.transformations = new Map();
        for (let t of tables.transformations) {
            this.transformations.set(t.name, t);
        }
    }
    addTable(table) {
        this.sources.set(table.name, table);
        return table.name;
    }
    getTable(name) {
        return this.sources.get(name);
    }
    doAllTransformations() {
        let result_table = "none";
        for (let t of this.transformations.keys()) {
            result_table = this.relTransformations.doTransformation(this, this.transformations.get(t));
        }
        return result_table;
    }
    doScriptedTransformnations() {
        let result_table = "none";
        return result_table;
    }
    runTransformations() {
        console.log("Running Transformations now...");
        const start = performance.now();
        let resultTableName = this.doAllTransformations();
        if (this.getTable(resultTableName) != undefined)
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
        var requests = remoteSources.map((key) => {
            //console.log(`Fetching ${key}...`);
            let fetchPromise = fetch(this.sources.get(key).url);
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
            for (let i = 0; i < results.length; i++) {
                //console.log(results[i]);
                if (results[i].status == undefined) {
                    //console.log("Result " + i + ": " + remoteSources[i] + " with length " + results[i].length);
                    this.getTable(remoteSources[i]).setDataNotPlain(results[i]);
                }
                else {
                    console.log("Error while fetching " + remoteSources[i]);
                    console.log(results[i]);
                }
            }
            Array.from(this.sources.keys()).forEach((key) => { console.log("Source " + key + ": " + (this.getTable(key).url == undefined ? "local" : "remote") + " length " + this.getTable(key).rows.length); });
            this.runTransformations();
        }).catch(err => {
            console.log(`Error while fetching`);
            console.log(err);
        });
    }
}
exports.DataSource = DataSource;
//# sourceMappingURL=DataSource.js.map