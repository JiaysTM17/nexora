import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allocateDiscount } from '../src/common';

test('discount allocation preserves every dong with deterministic remainder', () => {
  assert.deepEqual(allocateDiscount(2, [1, 1, 1]), [1, 1, 0]);
  assert.deepEqual(allocateDiscount(0, [0, 0]), [0, 0]);
  for (let i = 1; i <= 200; i++) {
    const weights = [i * 970, i * 131, i * 7], amount = i * 367 + 1;
    const parts = allocateDiscount(amount, weights);
    assert.equal(parts.reduce((a,b) => a+b,0), amount);
    parts.forEach((part, j) => assert.ok(Number.isInteger(part) && part >= 0 && part <= weights[j]));
  }
});
test('invalid money allocations fail closed', () => {
  for (const amount of [-1, 4, 0.5]) assert.throws(() => allocateDiscount(amount, [1,1,1]));
});
