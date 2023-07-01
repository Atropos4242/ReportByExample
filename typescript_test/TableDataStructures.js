"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTableDataStructureForm = void 0;
const zod_1 = require("zod");
const TableMetaDataTreeConColFltForm = zod_1.z.object({
    FLT_COL: zod_1.z.string(),
    FLT_VALUE: zod_1.z.string().optional(),
    FLT_VALUE_COLUMN: zod_1.z.string().optional()
}).strict();
const TableMetaDataForm = zod_1.z.object({
    TREECON: zod_1.z.object({
        TRANS_NAME: zod_1.z.string(),
        AGG_COL: zod_1.z.string().optional(),
        COL_FLT: zod_1.z.array(TableMetaDataTreeConColFltForm).optional()
    }).strict(),
    BLOWUP: zod_1.z.object({
        COLUMN: zod_1.z.string(),
        TARGET_COLUMN: zod_1.z.string()
    }).strict().optional()
}).strict().optional();
const ColumnForm = zod_1.z.object({
    col_nr: zod_1.z.number(),
    name: zod_1.z.string(),
    columnMetaData: TableMetaDataForm,
}).strict().optional();
const TransformationBlowupForm = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal('BLOWUP'),
    sourceA: zod_1.z.string(),
    sourceB: zod_1.z.string(),
    sourceResult: zod_1.z.string(),
    blowup_srcA_col_name: zod_1.z.string(),
    blowup_srcB_col_name: zod_1.z.string()
}).strict();
const TransformationTreeConForm = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal('TREECON'),
    sourceA: zod_1.z.string(),
    sourceB: zod_1.z.string(),
    sourceResult: zod_1.z.string()
}).strict();
const OrderConditionForm = zod_1.z.object({
    col_nr: zod_1.z.number(),
    name: zod_1.z.string(),
    order_mode: zod_1.z.string()
});
const ProjectConditionForm = zod_1.z.object({
    col_nr: zod_1.z.number(),
    name: zod_1.z.string()
});
const GroupConditionForm = zod_1.z.object({
    name: zod_1.z.string(),
    group_mode: zod_1.z.string()
});
const JoinConditionForm = zod_1.z.object({
    srcA: zod_1.z.object({
        col_name: zod_1.z.string(),
        col_nr: zod_1.z.number()
    }),
    srcB: zod_1.z.object({
        col_name: zod_1.z.string(),
        col_nr: zod_1.z.number()
    }),
    operation: zod_1.z.string()
});
const TransformationJoinForm = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal('JOIN_FULL_TABLE_SCAN'),
    sourceA: zod_1.z.string(),
    sourceB: zod_1.z.string(),
    sourceResult: zod_1.z.string(),
    join_conditions: zod_1.z.array(JoinConditionForm)
});
const TransformationGroupForm = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal('GROUP'),
    source: zod_1.z.string(),
    sourceResult: zod_1.z.string(),
    group_columns: zod_1.z.array(GroupConditionForm)
});
const TransformationOrderForm = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.literal('ORDER'),
    source: zod_1.z.string(),
    sourceResult: zod_1.z.string(),
    order_columns: zod_1.z.array(OrderConditionForm)
});
const TransformationForm = zod_1.z.union([TransformationBlowupForm, TransformationTreeConForm, TransformationGroupForm, TransformationJoinForm, TransformationOrderForm]);
const TableDataStructureForm = zod_1.z.object({
    tableDataStructures: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        columns: zod_1.z.array(ColumnForm),
        url: zod_1.z.string().optional()
    }).strict()),
    transformations: zod_1.z.array(TransformationForm)
}).strict();
function validateTableDataStructureForm(tds) {
    TableDataStructureForm.parse(tds);
}
exports.validateTableDataStructureForm = validateTableDataStructureForm;
//# sourceMappingURL=TableDataStructures.js.map