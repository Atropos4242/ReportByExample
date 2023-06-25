import { TransformationType } from './Transformation';
import { TableMetaData } from './TableMetaData';
import { Column } from './Table';

export interface TableDataStructures {
    tableDataStructures:
    [
        {
            name : string,   
            columns : Column[],
            url? : string
        }
    ],
    transformations: [TransformationType]
}