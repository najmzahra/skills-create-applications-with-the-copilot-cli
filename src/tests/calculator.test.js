jest.mock('node:readline/promises', () => ({
  createInterface: jest.fn(),
}));

const readline = require('node:readline/promises');
const calculator = require('../calculator');

describe('calculator helpers', () => {
  test('exposes the four supported operations', () => {
    expect(Object.keys(calculator.OPERATIONS)).toEqual(['+', '-', '*', '/']);
  });

  test.each([
    ['2', 2],
    ['10', 10],
    ['45.5', 45.5],
    ['0', 0],
    ['', 0],
  ])('parseNumber converts %s to %s', (input, expected) => {
    expect(calculator.parseNumber(input)).toBe(expected);
  });

  test.each(['abc', '12px', 'NaN'])('parseNumber rejects %s', (input) => {
    expect(calculator.parseNumber(input)).toBeNull();
  });
});

describe('calculate', () => {
  test.each([
    [2, '+', 3, 5],
    [10, '-', 4, 6],
    [45, '*', 2, 90],
    [20, '/', 5, 4],
    [7.5, '+', 2.5, 10],
    [-4, '*', 3, -12],
  ])('calculates %s %s %s = %s', (left, operator, right, expected) => {
    expect(calculator.calculate(left, operator, right)).toBe(expected);
  });

  test('throws for division by zero', () => {
    expect(() => calculator.calculate(10, '/', 0)).toThrow('Division by zero is not allowed.');
  });

  test('throws for unsupported operations', () => {
    expect(() => calculator.calculate(10, '^', 2)).toThrow('Unsupported operation: ^');
  });
});

describe('runFromArgs', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test('prints and returns true for valid arguments', () => {
    expect(calculator.runFromArgs(['2', '+', '3'])).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(5);
  });

  test('returns false when arguments are incomplete', () => {
    expect(calculator.runFromArgs(['2', '+'])).toBe(false);
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('throws when operands are invalid', () => {
    expect(() => calculator.runFromArgs(['2', '+', 'abc'])).toThrow('Both operands must be valid numbers.');
  });
});

describe('runInteractive', () => {
  test('starts and exits when q is entered', async () => {
    const question = jest.fn().mockResolvedValue('q');
    const close = jest.fn();

    readline.createInterface.mockReturnValue({ question, close });

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await calculator.runInteractive();

    expect(question).toHaveBeenCalledWith('\nFirst number (or "q" to quit): ');
    expect(close).toHaveBeenCalled();

    logSpy.mockRestore();
  });
});
