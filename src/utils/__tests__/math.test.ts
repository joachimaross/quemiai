import { add, subtract } from '../math';

describe('Math functions', () => {
  test('add should correctly add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('subtract should correctly subtract two numbers', () => {
    expect(subtract(5, 2)).toBe(3);
  });
});
