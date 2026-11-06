import test from 'node:test';
import assert from 'node:assert/strict';
import { acceleration, step, circularSpeed } from '../src/core.mjs';
test('gravity is finite at the origin and points toward the star', () => {
  const center = acceleration(0,0);
  assert.ok(Number.isFinite(center.x)); assert.equal(Math.abs(center.x),0);
  assert.ok(acceleration(10,0).x < 0);
});
test('a circular orbit keeps its radius over a full revolution', () => {
  let body = { x: 100, y: 0, vx: 0, vy: circularSpeed(100) };
  const period = 2*Math.PI*100/body.vy;
  const dt = period/20000;
  for (let i=0;i<20000;i++) body = step(body,dt);
  assert.ok(Math.abs(Math.hypot(body.x,body.y)-100)<.001);
  assert.ok(Math.hypot(body.x-100,body.y)<.1);
});
