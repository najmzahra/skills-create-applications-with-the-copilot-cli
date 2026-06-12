#!/usr/bin/env node

/**
 * Supported operations:
 * - addition (+)
 * - subtraction (-)
 * - multiplication (*)
 * - division (/)
 * - modulo (%)
 * - power (^)
 * - square root (sqrt)
 */

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const OPERATIONS = {
  '+': {
    name: 'addition',
    arity: 2,
    apply: (left, right) => left + right,
  },
  '-': {
    name: 'subtraction',
    arity: 2,
    apply: (left, right) => left - right,
  },
  '*': {
    name: 'multiplication',
    arity: 2,
    apply: (left, right) => left * right,
  },
  '/': {
    name: 'division',
    arity: 2,
    apply: (left, right) => left / right,
  },
  '%': {
    name: 'modulo',
    arity: 2,
    apply: (left, right) => modulo(left, right),
  },
  '^': {
    name: 'power',
    arity: 2,
    apply: (left, right) => power(left, right),
  },
  sqrt: {
    name: 'square root',
    arity: 1,
    apply: (value) => squareRoot(value),
  },
};

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function modulo(a, b) {
  if (b === 0) {
    throw new Error('Modulo by zero is not allowed.');
  }

  return a % b;
}

function power(base, exponent) {
  return base ** exponent;
}

function squareRoot(n) {
  if (n < 0) {
    throw new Error('Square root of negative numbers is not allowed.');
  }

  return Math.sqrt(n);
}

function calculate(left, operator, right) {
  const operation = OPERATIONS[operator];

  if (!operation) {
    throw new Error(`Unsupported operation: ${operator}`);
  }

  if (operation.arity === 1) {
    return operation.apply(left);
  }

  if (right === undefined) {
    throw new Error(`Operation ${operator} requires two numbers.`);
  }

  if ((operator === '/' || operator === '%') && right === 0) {
    throw new Error(operator === '/' ? 'Division by zero is not allowed.' : 'Modulo by zero is not allowed.');
  }

  return operation.apply(left, right);
}

async function runInteractive() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log('Node.js CLI Calculator');
  console.log('Use +, -, *, /, %, ^, or sqrt');

  while (true) {
    const leftInput = await rl.question('\nFirst number (or "q" to quit): ');

    if (leftInput.trim().toLowerCase() === 'q') {
      break;
    }

    const left = parseNumber(leftInput);
    if (left === null) {
      console.log('Please enter a valid number.');
      continue;
    }

    const operator = await rl.question('Operation (+, -, *, /, %, ^, sqrt): ');
    if (!OPERATIONS[operator]) {
      console.log('Please choose one of +, -, *, /, %, ^, or sqrt.');
      continue;
    }

    const operation = OPERATIONS[operator];
    let right;

    try {
      if (operation.arity === 1) {
        const result = calculate(left, operator);
        console.log(`Result: ${result}`);
        continue;
      }

      const rightInput = await rl.question('Second number: ');
      right = parseNumber(rightInput);
      if (right === null) {
        console.log('Please enter a valid number.');
        continue;
      }

      const result = calculate(left, operator, right);
      console.log(`Result: ${result}`);
    } catch (error) {
      console.log(error.message);
    }
  }

  rl.close();
}

function runFromArgs(args) {
  const [leftInput, operator, rightInput] = args;

  if (!leftInput || !operator) {
    return false;
  }

  const left = parseNumber(leftInput);
  const operation = OPERATIONS[operator];

  if (left === null) {
    throw new Error('Both operands must be valid numbers.');
  }

  if (!operation) {
    throw new Error(`Unsupported operation: ${operator}`);
  }

  if (operation.arity === 1) {
    const result = calculate(left, operator);
    console.log(result);
    return true;
  }

  if (!rightInput) {
    return false;
  }

  const right = parseNumber(rightInput);

  if (right === null) {
    throw new Error('Both operands must be valid numbers.');
  }

  const result = calculate(left, operator, right);
  console.log(result);
  return true;
}

async function main() {
  const args = process.argv.slice(2);

  if (!runFromArgs(args)) {
    await runInteractive();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  OPERATIONS,
  calculate,
  modulo,
  parseNumber,
  power,
  runFromArgs,
  runInteractive,
  squareRoot,
};
