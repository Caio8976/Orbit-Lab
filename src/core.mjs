export const MU = 24000;
export function acceleration(x, y, gravity = 1) {
  const softened = x*x + y*y + 36;
  const factor = -MU * gravity / Math.pow(softened, 1.5);
  return { x: x * factor, y: y * factor };
}
export function step(body, dt, gravity = 1) {
  const a = acceleration(body.x, body.y, gravity);
  const x = body.x + body.vx * dt + .5 * a.x * dt * dt;
  const y = body.y + body.vy * dt + .5 * a.y * dt * dt;
  const b = acceleration(x, y, gravity);
  return { ...body, x, y, vx: body.vx + .5 * (a.x+b.x)*dt, vy: body.vy + .5*(a.y+b.y)*dt };
}
export function circularSpeed(radius, gravity = 1) {
  return Math.sqrt(MU * gravity * radius * radius / Math.pow(radius * radius + 36, 1.5));
}
