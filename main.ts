// Tiny Stack VM: from-scratch interpreter for make.fun's tiny stack ISA v1
// (kit: generator/subject/ISA.md; reference VM: generator/subject/vm.mjs).
// One run covers a whole set: /input/<id>/program.bin + input.bin
// -> /output/<id>/stdout.bin + exit.txt. Deterministic: no clock, no random.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Per-opcode [immediate bytes, popped, pushed]; -1 = unknown opcode.
const I = new Int8Array(256).fill(-1), P = new Int8Array(256), Q = new Int8Array(256);
const d = (b: number, i: number, p: number, q: number) => { I[b] = i; P[b] = p; Q[b] = q; };
d(0,0,0,0);d(1,1,0,1);d(2,4,0,1);d(3,0,1,0);d(4,0,1,2);d(5,0,2,2);d(6,0,2,3);d(7,0,3,3);
d(23,0,1,1);d(27,0,1,1);d(48,2,0,0);d(49,2,1,0);d(50,2,1,0);d(51,2,0,0);d(52,0,0,0);
d(64,0,1,1);d(65,0,2,0);d(80,0,1,0);d(81,0,1,0);d(82,0,0,1);d(83,0,1,0);
for (let b = 16; b <= 34; b++) if (b !== 23 && b !== 27 && b !== 31) d(b, 0, 2, 1);

function run(p: Uint8Array, inp: Uint8Array) {
  const s = new Int32Array(256), c = new Int32Array(64), m = new Int32Array(256);
  const o = new Uint8Array(65536);
  let sp = 0, cp = 0, ol = 0, ip = 0, pc = 0, n = 0;
  const e = new TextEncoder();
  const f = (x: number) => ({ o: o.slice(0, ol), x });
  for (;;) {
    if (n >= 1e6) return f(10);
    if (pc < 0 || pc >= p.length) return f(9);
    const op = p[pc], im = I[op];
    if (im < 0) return f(5);
    if (pc + im >= p.length) return f(9);
    n++;
    const nx = pc + 1 + im;
    if (sp < P[op]) return f(2);
    if (sp - P[op] + Q[op] > 256) return f(3);
    pc = nx;
    switch (op) {
      case 0: return f(0);
      case 1: s[sp++] = (p[nx - 1] << 24) >> 24; break; // PUSH8, sign-extended
      case 2: s[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
      case 3: sp--; break;
      case 4: s[sp] = s[sp - 1]; sp++; break;
      case 5: { const t = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = t; break; }
      case 6: s[sp] = s[sp - 2]; sp++; break;
      case 7: { const a = s[sp - 3]; s[sp - 3] = s[sp - 2]; s[sp - 2] = s[sp - 1]; s[sp - 1] = a; break; }
      case 23: s[sp - 1] = (-s[sp - 1]) | 0; break; // NEG, wraps
      case 27: s[sp - 1] = ~s[sp - 1]; break;
      case 16: case 17: case 18: case 19: case 20: case 21: case 22:
      case 24: case 25: case 26: case 28: case 29: case 30: case 32: case 33: case 34: {
        const b = s[sp - 1], a = s[sp - 2];
        let r: number;
        if (op === 16) r = (a + b) | 0;
        else if (op === 17) r = (a - b) | 0;
        else if (op === 18) r = Math.imul(a, b); // low 32 bits of the exact product
        else if (op === 19) { if (b === 0) return f(4); r = (a / b) | 0; } // DIV truncates toward zero; INT_MIN/-1 wraps
        else if (op === 20) { if (b === 0) return f(4); r = b === -1 ? 0 : (a % b) | 0; } // MOD, sign of a
        else if (op === 21) { if (b === 0) return f(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; } // DIVU
        else if (op === 22) { if (b === 0) return f(4); r = ((a >>> 0) % (b >>> 0)) | 0; } // MODU
        else if (op === 24) r = a & b;
        else if (op === 25) r = a | b;
        else if (op === 26) r = a ^ b;
        else if (op === 28) r = a << (b & 31); // only the low 5 bits of b count
        else if (op === 29) r = a >> (b & 31);
        else if (op === 30) r = (a >>> (b & 31)) | 0;
        else if (op === 32) r = a === b ? 1 : 0;
        else if (op === 33) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0; // LTU
        sp -= 2;
        s[sp++] = r;
        break;
      }
      case 48: case 49: case 50: { // JMP / JZ / JNZ, signed 16-bit offset from next
        const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16;
        if (op === 48) { pc = nx + rel; break; }
        const v = s[--sp];
        if ((op === 49 && v === 0) || (op === 50 && v !== 0)) pc = nx + rel;
        break;
      }
      case 51: // CALL, unsigned 16-bit target
        if (cp >= 64) return f(7);
        c[cp++] = nx;
        pc = p[nx - 2] | (p[nx - 1] << 8);
        break;
      case 52:
        if (cp === 0) return f(8);
        pc = c[--cp];
        break;
      case 64: { // LOAD
        const a = s[sp - 1];
        if (a < 0 || a >= 256) return f(6);
        s[sp - 1] = m[a];
        break;
      }
      case 65: { // STORE ( v addr -- )
        const a = s[sp - 1], v = s[sp - 2];
        if (a < 0 || a >= 256) return f(6);
        sp -= 2;
        m[a] = v;
        break;
      }
      case 80: { // PRINT, decimal ASCII; past the output limit it traps and writes nothing
        const b = e.encode(String(s[sp - 1]));
        if (ol + b.length > 65536) return f(11);
        sp--;
        o.set(b, ol);
        ol += b.length;
        break;
      }
      case 81:
        if (ol + 1 > 65536) return f(11);
        o[ol++] = s[--sp] & 255;
        break;
      case 82: // IN, -1 once the input is used up
        s[sp++] = ip < inp.length ? inp[ip++] : -1;
        break;
      case 83: // EXIT, code is the low byte
        return f(s[--sp] & 255);
      default: return f(5);
    }
  }
}

const I0 = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O0 = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const ent of readdirSync(I0, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
  if (!ent.isDirectory()) continue;
  const r = run(readFileSync(join(I0, ent.name, 'program.bin')), readFileSync(join(I0, ent.name, 'input.bin')));
  const od = join(O0, ent.name);
  mkdirSync(od, { recursive: true });
  writeFileSync(join(od, 'stdout.bin'), r.o);
  writeFileSync(join(od, 'exit.txt'), `${r.x}\n`);
}
