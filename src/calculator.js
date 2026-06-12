#!/usr/bin/env node

/**
 * Supported operations:
 * - addition (+)
 * - subtraction (-)
 * - multiplication (*)
 * - division (/)
 */

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const OPERATIONS = {
  '+': {
    name: 'addition',
    apply: (left, right) => left + right,
  },
  '-': {
    name: 'subtraction',
    apply: (left, right) => left - right,
  },
  '*': {
    name: 'multiplication',
    apply: (left, right) => left * right,
  },
  '/': {
    name: 'division',
    apply: (left, right) => left / right,
  },
};

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculate(left, operator, right) {
  const operation = OPERATIONS[operator];

  if (!operation) {
    throw new Error(`Unsupported operation: ${operator}`);
  }

  if (operator === '/' && right === 0) {
    throw new Error('Division by zero is not allowed.');
  }

  return operation.apply(left, right);
}

async function runInteractive() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log('Node.js CLI Calculator');
  console.log('Use +, -, *, or /');

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

    const operator = await rl.question('Operation (+, -, *, /): ');
    if (!OPERATIONS[operator]) {
      console.log('Please choose one of +, -, *, or /.');
      continue;
    }

    const rightInput = await rl.question('Second number: ');
    const right = parseNumber(rightInput);
    if (right === null) {
      console.log('Please enter a valid number.');
      continue;
    }

    try {
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

  if (!leftInput || !operator || !rightInput) {
    return false;
  }

  const left = parseNumber(leftInput);
  const right = parseNumber(rightInput);

  if (left === null || right === null) {
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
  parseNumber,
  runFromArgs,
  runInteractive,
};
