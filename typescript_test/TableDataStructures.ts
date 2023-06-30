import { z } from "zod"

const TableMetaDataTreeConColFltForm = z.object({ 
        FLT_COL: z.string(), 
        FLT_VALUE: z.string().optional(),
        FLT_VALUE_COLUMN: z.string().optional()
    }).strict()

const TableMetaDataForm = z.object({
    TREECON: z.object({ 
        TRANS_NAME: z.string(),
        AGG_COL: z.string().optional(), 
        COL_FLT: z.array(TableMetaDataTreeConColFltForm).optional()
    }).strict(),
    BLOWUP: z.object({ 
        COLUMN: z.string(), 
        TARGET_COLUMN: z.string()
    }).strict().optional()    
}).strict().optional();    

const ColumnForm = z.object({ 
    col_nr: z.number(), 
    name: z.string(), 
    columnMetaData: TableMetaDataForm,
    }).strict().optional()

const TransformationBlowupForm = z.object({
    name: z.string(),
    type: z.literal('BLOWUP'),
    sourceA: z.string(),
    sourceB: z.string(),
    sourceResult: z.string(),
    blowup_srcA_col_name: z.string(),
    blowup_srcB_col_name: z.string()
}).strict();

const TransformationTreeConForm = z.object({
    name: z.string(),
    type: z.literal('TREECON'),
    sourceA: z.string(),
    sourceB: z.string(),
    sourceResult: z.string()
}).strict();

const OrderConditionForm = z.object({
    col_nr : z.number(),
    name : z.string(),
    order_mode : z.string()
})

const ProjectConditionForm = z.object({
    col_nr: z.number(),
    name: z.string()
})

const GroupConditionForm = z.object({
    col_nr: z.number(),
    name: z.string(),    
    group_mode: z.string()
})

const JoinConditionForm = z.object({
    srcA: z.object({
        col_name: z.string(),   
        col_nr: z.number()
    }),
    srcB: z.object({
        col_name: z.string(),
        col_nr : z.number()
    }),
    operation: z.string()    
})


const TransformationJoinForm =  z.object({
    name: z.string(),
    type: z.literal('JOIN_FULL_TABLE_SCAN'),
    sourceA: z.string(),
    sourceB: z.string(),
    sourceResult: z.string(),    
    join_conditions: z.array(JoinConditionForm)  
});

const TransformationGroupForm = z.object({
    name: z.string(),
    type: z.literal('GROUP'),
    source: z.string(),
    sourceResult: z.string(),      
    group_columns: z.array( z.object({
        col_nr: z.number(), 
        name: z.string(),
        group_mode: z.string() 
    }))
})

const TransformationOrderForm =  z.object({
    name: z.string(),
    type: z.literal('ORDER'),
    source: z.string(),
    sourceResult: z.string(),    
    order_columns: z.array(OrderConditionForm)
})

const TransformationForm = z.union([TransformationBlowupForm,TransformationTreeConForm,TransformationGroupForm,TransformationJoinForm,TransformationOrderForm]);

const TableDataStructureForm = z.object({
    tableDataStructures: z.array( 
        z.object( {
            name: z.string(),
            columns : z.array(ColumnForm),
            url: z.string().optional()
        }).strict()
    ),
    transformations: z.array(TransformationForm)
  }).strict();

export type TableDataStructureType = z.infer<typeof TableDataStructureForm>;
export type ColumnType = z.infer<typeof ColumnForm>;
export type TableMetaDataType = z.infer<typeof TableMetaDataForm>;
export type TransformationType = z.infer<typeof TransformationForm>;
export type TransformationBlowupType = z.infer<typeof TransformationBlowupForm>;
export type TransformationTreeConType = z.infer<typeof TransformationTreeConForm>;
export type OrderConditionType = z.infer<typeof OrderConditionForm>;
export type ProjectConditionType = z.infer<typeof ProjectConditionForm>;
export type GroupConditionType = z.infer<typeof GroupConditionForm>;
export type JoinConditionType = z.infer<typeof JoinConditionForm>;
export type TransformationJoinType = z.infer<typeof TransformationJoinForm>;
export type TransformationGroupType = z.infer<typeof TransformationGroupForm>;
export type TransformationOrderType = z.infer<typeof TransformationOrderForm>;
export type TableMetaDataTreeConColFltType = z.infer<typeof TableMetaDataTreeConColFltForm>;

export function validateTableDataStructureForm(tds: any) {
    TableDataStructureForm.parse(tds);
}