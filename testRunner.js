function expect(received) {
  return {
    toBe(expected) {
      if (received !== expected) {
        throw new Error(`Expected ${JSON.stringify(received)} to be ${JSON.stringify(expected)}`);
      }
    }
  };
}

function test(name, fn) {
  try {
    fn();
    console.log(`\u2714 ${name}`);
  } catch (err) {
    console.error(`\u2718 ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

global.expect = expect;
global.test = test;

const fs = require('fs');
const path = require('path');
const testDir = path.join(__dirname, 'tests');
fs.readdirSync(testDir)
  .filter(f => f.endsWith('.test.js'))
  .forEach(f => require(path.join(testDir, f)));
