"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = require("../math");
describe('Math functions', () => {
    test('add should correctly add two numbers', () => {
        expect((0, math_1.add)(1, 2)).toBe(3);
    });
    test('subtract should correctly subtract two numbers', () => {
        expect((0, math_1.subtract)(5, 2)).toBe(3);
    });
    test('multiply should correctly multiply two numbers', () => {
        expect((0, math_1.multiply)(2, 3)).toBe(6);
    });
});
//# sourceMappingURL=math.test.js.map