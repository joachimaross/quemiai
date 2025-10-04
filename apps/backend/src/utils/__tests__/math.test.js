"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var math_1 = require("../math");
describe('Math functions', function () {
    test('add should correctly add two numbers', function () {
        expect((0, math_1.add)(1, 2)).toBe(3);
    });
    test('subtract should correctly subtract two numbers', function () {
        expect((0, math_1.subtract)(5, 2)).toBe(3);
    });
    test('multiply should correctly multiply two numbers', function () {
        expect((0, math_1.multiply)(2, 3)).toBe(6);
    });
});
