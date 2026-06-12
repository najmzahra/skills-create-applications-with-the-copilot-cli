jest.mock('node:readline/promises', () => ({
  createInterface: jest.fn(),
}));

const readline = require('node:readline/promises');
const calculator = require('../calculator');

describe('calculator helpers', () => {
  test('exposes the supported operations', () => {
    expect(Object.keys(calculator.OPERATIONS)).toEqual(['+', '-', '*', '/', '%', '^', 'sqrt']);
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
    [20, '%', 6, 2],
    [2, '^', 3, 8],
    [7.5, '+', 2.5, 10],
    [-4, '*', 3, -12],
  ])('calculates %s %s %s = %s', (left, operator, right, expected) => {
    expect(calculator.calculate(left, operator, right)).toBe(expected);
  });

  test('throws for division by zero', () => {
    expect(() => calculator.calculate(10, '/', 0)).toThrow('Division by zero is not allowed.');
  });

  test('throws for modulo by zero', () => {
    expect(() => calculator.calculate(10, '%', 0)).toThrow('Modulo by zero is not allowed.');
  });

  test('throws for unsupported operations', () => {
    expect(() => calculator.calculate(10, '?', 2)).toThrow('Unsupported operation: ?');
  });

  test('calculates square root', () => {
    expect(calculator.calculate(9, 'sqrt')).toBe(3);
  });

  test('throws for square root of negative numbers', () => {
    expect(() => calculator.calculate(-9, 'sqrt')).toThrow('Square root of negative numbers is not allowed.');
  });
});

describe('standalone operations', () => {
  test('modulo returns the remainder', () => {
    expect(calculator.modulo(17, 5)).toBe(2);
  });

  test('power raises a base to an exponent', () => {
    expect(calculator.power(4, 3)).toBe(64);
  });

  test('squareRoot returns the square root', () => {
    expect(calculator.squareRoot(16)).toBe(4);
  });

  test('squareRoot throws for negative values', () => {
    expect(() => calculator.squareRoot(-1)).toThrow('Square root of negative numbers is not allowed.');
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

  test('supports modulo from arguments', () => {
    expect(calculator.runFromArgs(['5', '%', '2'])).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(1);
  });

  test('supports power from arguments', () => {
    expect(calculator.runFromArgs(['2', '^', '3'])).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(8);
  });

  test('supports unary square root from arguments', () => {
    expect(calculator.runFromArgs(['9', 'sqrt'])).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(3);
  });

  test('supports the square root image example from arguments', () => {
    expect(calculator.runFromArgs(['16', 'sqrt'])).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(4);
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
