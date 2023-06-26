"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDataStructureForm = void 0;
const zod_1 = require("zod");
exports.TableDataStructureForm = zod_1.z.object({
    firstName: zod_1.z.string().min(1).max(18),
    lastName: zod_1.z.string().min(1).max(18),
    phone: zod_1.z.string().min(10).max(14).optional(),
    email: zod_1.z.string().email(),
    url: zod_1.z.string().url().optional(),
});
//# sourceMappingURL=JsonValidation.js.map