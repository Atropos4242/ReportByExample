"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Data_Set_A_json_1 = __importDefault(require("./Data_Set_A.json"));
var Data_Set_B_json_1 = __importDefault(require("./Data_Set_B.json"));
var Table_1 = require("./Table");
var myDataA = Data_Set_A_json_1.default;
var myTableA = new Table_1.Table(myDataA);
console.log(myTableA.toText());
var myDataB = Data_Set_B_json_1.default;
var myTableB = new Table_1.Table(myDataB);
console.log(myTableB.toText());
//# sourceMappingURL=helloworld.js.map