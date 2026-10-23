/* Colisiones, rayos y navegación de los bots */
const GRID = { cs: 4, ox: 0, oz: 0, nx: 0, nz: 0, cells: null, mark: null, stamp: 0, n: -1, out: [] };
function buildGrid() {
  const e = LV.boxes,
    t = GRID.cs;
  let o = 1e9,
    n = 1e9,
    a = -1e9,
    r = -1e9;
  for (const t of e)
    ((o = Math.min(o, t.min[0])),
      (n = Math.min(n, t.min[2])),
      (a = Math.max(a, t.max[0])),
      (r = Math.max(r, t.max[2])));
  ((o = Math.max(o, -200)),
    (n = Math.max(n, -200)),
    (a = Math.min(a, 200)),
    (r = Math.min(r, 200)),
    (GRID.ox = o),
    (GRID.oz = n),
    (GRID.nx = Math.max(1, Math.ceil((a - o) / t) + 1)),
    (GRID.nz = Math.max(1, Math.ceil((r - n) / t) + 1)),
    (GRID.cells = Array.from({ length: GRID.nx * GRID.nz }, () => [])),
    (GRID.big = []),
    e.forEach((e, a) => {
      const r = clamp(Math.floor((e.min[0] - o) / t), 0, GRID.nx - 1),
        s = clamp(Math.floor((e.max[0] - o) / t), 0, GRID.nx - 1),
        l = clamp(Math.floor((e.min[2] - n) / t), 0, GRID.nz - 1),
        i = clamp(Math.floor((e.max[2] - n) / t), 0, GRID.nz - 1);
      if ((s - r + 1) * (i - l + 1) > 64) GRID.big.push(a);
      else for (let e = l; e <= i; e++) for (let t = r; t <= s; t++) GRID.cells[e * GRID.nx + t].push(a);
    }),
    (GRID.mark = new Int32Array(e.length)),
    (GRID.n = e.length));
}
function boxesIn(e, t, o, n) {
  GRID.n !== LV.boxes.length && buildGrid();
  const a = GRID.out,
    r = GRID.cs,
    s = LV.boxes,
    l = GRID.mark,
    i = ++GRID.stamp;
  a.length = 0;
  for (const e of GRID.big) a.push(s[e]);
  const c = clamp(Math.floor((e - GRID.ox) / r), 0, GRID.nx - 1),
    d = clamp(Math.floor((o - GRID.ox) / r), 0, GRID.nx - 1),
    u = clamp(Math.floor((t - GRID.oz) / r), 0, GRID.nz - 1),
    p = clamp(Math.floor((n - GRID.oz) / r), 0, GRID.nz - 1);
  for (let e = u; e <= p; e++)
    for (let t = c; t <= d; t++) for (const o of GRID.cells[e * GRID.nx + t]) l[o] !== i && ((l[o] = i), a.push(s[o]));
  return a;
}
function boxesAt(e, t, o) {
  return boxesIn(e - o, t - o, e + o, t + o);
}
function groundAt(e, t, o, n = 0.15) {
  let a = LV.terrain ? LV.terrain(e, t) : -60;
  const r = o + 0.5;
  for (const o of boxesAt(e, t, n)) {
    const s = o.max[1];
    s > r || s <= a || (inBoxXZ(o, e, t, n) && (a = s));
  }
  return a;
}
function surfAt(e, t, o) {
  let n = -99,
    a = LV.tsurf;
  LV.terrain && (n = LV.terrain(e, t));
  for (const r of boxesAt(e, t, 0.01)) {
    const s = r.max[1];
    s > o + 0.3 || s < n || (inBoxXZ(r, e, t, 0) && ((n = s), (a = r.surf)));
  }
  return a;
}
function collide(e, t, o) {
  for (let n = 0; n < 2; n++) {
    for (const n of boxesAt(e.x, e.z, t + 0.05)) {
      if (n.max[1] <= e.y + 0.45 || n.min[1] >= e.y + o) continue;
      if (e.x < n.min[0] - t || e.x > n.max[0] + t || e.z < n.min[2] - t || e.z > n.max[2] + t) continue;
      if (n.o) {
        const o = n.o,
          a = e.x - o.cx,
          r = e.z - o.cz;
        let s = a * o.c - r * o.s,
          l = a * o.s + r * o.c;
        const i = clamp(s, -o.hx, o.hx),
          c = clamp(l, -o.hz, o.hz),
          d = s - i,
          u = l - c,
          p = d * d + u * u;
        if (p >= t * t) continue;
        if (p > 1e-8) {
          const e = Math.sqrt(p);
          ((s = i + (d / e) * t), (l = c + (u / e) * t));
        } else
          o.hx - Math.abs(s) < o.hz - Math.abs(l)
            ? (s = Math.sign(s || 1) * (o.hx + t))
            : (l = Math.sign(l || 1) * (o.hz + t));
        ((e.x = o.cx + s * o.c + l * o.s), (e.z = o.cz - s * o.s + l * o.c));
        continue;
      }
      const a = clamp(e.x, n.min[0], n.max[0]),
        r = clamp(e.z, n.min[2], n.max[2]),
        s = e.x - a,
        l = e.z - r,
        i = s * s + l * l;
      if (!(i >= t * t))
        if (i > 1e-8) {
          const o = Math.sqrt(i);
          ((e.x += (s / o) * (t - o)), (e.z += (l / o) * (t - o)));
        } else {
          const o = [e.x - n.min[0], n.max[0] - e.x, e.z - n.min[2], n.max[2] - e.z];
          let a = 0;
          for (let e = 1; e < 4; e++) o[e] < o[a] && (a = e);
          0 == a ? (e.x = n.min[0] - t) : 1 == a ? (e.x = n.max[0] + t) : (e.z = 2 == a ? n.min[2] - t : n.max[2] + t);
        }
    }
    for (const n of LV.cyls) {
      if (n.y1 <= e.y + 0.45 || n.y0 >= e.y + o) continue;
      const a = e.x - n.x,
        r = e.z - n.z,
        s = Math.hypot(a, r),
        l = t + n.r;
      s < l && s > 1e-6 && ((e.x = n.x + (a / s) * l), (e.z = n.z + (r / s) * l));
    }
  }
  const n = LV.bounds;
  ((e.x = clamp(e.x, -n, n)), (e.z = clamp(e.z, -n, n)));
}
const HIT = { t: 0, p: V3(), n: V3(), surf: '' };
function rayWorld(e, t, o, n = !0) {
  let a = o,
    r = !1,
    s = 0,
    l = 0,
    i = 0,
    c = '';
  const d = e.x,
    u = e.y,
    p = e.z;
  let m = t.x,
    h = t.y,
    f = t.z;
  (Math.abs(m) < 1e-9 && (m = 1e-9), Math.abs(h) < 1e-9 && (h = 1e-9), Math.abs(f) < 1e-9 && (f = 1e-9));
  const g = 1 / m,
    v = 1 / h,
    T = 1 / f,
    b = Math.min(o, 300);
  for (let e = 0; e < b && !(r && a <= e); e += 16) {
    const t = Math.min(b, e + 16),
      o = boxesIn(
        Math.min(d + m * e, d + m * t) - 0.1,
        Math.min(p + f * e, p + f * t) - 0.1,
        Math.max(d + m * e, d + m * t) + 0.1,
        Math.max(p + f * e, p + f * t) + 0.1
      ).slice();
    for (const e of o) {
      if (n && e.nb) continue;
      if (e.o) {
        const t = e.o,
          o = d - t.cx,
          n = p - t.cz,
          g = o * t.c - n * t.s,
          T = o * t.s + n * t.c;
        let b = m * t.c - f * t.s,
          y = m * t.s + f * t.c;
        (Math.abs(b) < 1e-9 && (b = 1e-9), Math.abs(y) < 1e-9 && (y = 1e-9));
        let x = (-t.hx - g) / b,
          M = (t.hx - g) / b,
          w = Math.min(x, M),
          E = Math.max(x, M),
          S = 0;
        ((x = (e.min[1] - u) * v), (M = (e.max[1] - u) * v));
        let G = Math.min(x, M),
          P = Math.max(x, M);
        if ((G > w && ((w = G), (S = 1)), P < E && (E = P), E < w)) continue;
        if (
          ((x = (-t.hz - T) / y),
          (M = (t.hz - T) / y),
          (G = Math.min(x, M)),
          (P = Math.max(x, M)),
          G > w && ((w = G), (S = 2)),
          P < E && (E = P),
          E < w || w < 0 || w >= a)
        )
          continue;
        ((a = w), (r = !0), (c = e.surf));
        let A = 0,
          R = 0;
        ((s = l = i = 0),
          0 == S ? (A = -Math.sign(b)) : 1 == S ? (l = -Math.sign(h)) : (R = -Math.sign(y)),
          1 != S && ((s = A * t.c + R * t.s), (i = -A * t.s + R * t.c)));
        continue;
      }
      let t = (e.min[0] - d) * g,
        o = (e.max[0] - d) * g,
        b = t < o ? t : o,
        y = t < o ? o : t,
        x = 0;
      ((t = (e.min[1] - u) * v), (o = (e.max[1] - u) * v));
      let M = t < o ? t : o,
        w = t < o ? o : t;
      (M > b && ((b = M), (x = 1)),
        w < y && (y = w),
        y < b ||
          ((t = (e.min[2] - p) * T),
          (o = (e.max[2] - p) * T),
          (M = t < o ? t : o),
          (w = t < o ? o : t),
          M > b && ((b = M), (x = 2)),
          w < y && (y = w),
          y < b ||
            b < 0 ||
            b >= a ||
            ((a = b),
            (r = !0),
            (c = e.surf),
            (s = l = i = 0),
            0 == x ? (s = -Math.sign(m)) : 1 == x ? (l = -Math.sign(h)) : (i = -Math.sign(f)))));
    }
  }
  for (const e of LV.cyls) {
    const t = d - e.x,
      o = p - e.z,
      n = m * m + f * f;
    if (n < 1e-8) continue;
    const g = 2 * (t * m + o * f),
      v = g * g - 4 * n * (t * t + o * o - e.r * e.r);
    if (v < 0) continue;
    const T = (-g - Math.sqrt(v)) / (2 * n);
    if (T < 0 || T >= a) continue;
    const b = u + h * T;
    b < e.y0 ||
      b > e.y1 ||
      ((a = T), (r = !0), (c = e.surf), (s = (t + m * T) / e.r), (l = 0), (i = (o + f * T) / e.r));
  }
  if (LV.terrain) {
    const e = LV.terrain,
      t = Math.min(a, 260);
    let o = 0,
      n = 0.7;
    for (let g = n; ; g += n) {
      const n = Math.min(g, t);
      if (u + h * n < e(d + m * n, p + f * n)) {
        let t = o,
          g = n;
        for (let o = 0; o < 9; o++) {
          const o = (t + g) / 2;
          u + h * o < e(d + m * o, p + f * o) ? (g = o) : (t = o);
        }
        if (g < a) {
          ((a = g), (r = !0), (c = LV.tsurf));
          const t = d + m * g,
            o = p + f * g,
            n = 0.3;
          ((s = e(t - n, o) - e(t + n, o)), (i = e(t, o - n) - e(t, o + n)), (l = 2 * n));
          const u = Math.hypot(s, l, i);
          ((s /= u), (l /= u), (i /= u));
        }
        break;
      }
      if (((o = n), n >= t)) break;
    }
  }
  return r ? ((HIT.t = a), HIT.p.set(d + m * a, u + h * a, p + f * a), HIT.n.set(s, l, i), (HIT.surf = c), HIT) : null;
}
function losClear(e, t, o = !0) {
  const n = V3().subVectors(t, e),
    a = n.length();
  if (a < 0.01) return !0;
  n.divideScalar(a);
  const r = rayWorld(e, n, a, o);
  return !r || r.t >= a - 0.05;
}
function buildNav() {
  const e = LV.wps;
  for (const t of e) ((t.y = groundAt(t.x, t.z, (t.yh || 0) + 0.3)), (t.n = []));
  const t = V3(),
    o = V3();
  for (let n = 0; n < e.length; n++)
    for (let a = n + 1; a < e.length; a++) {
      const r = e[n],
        s = e[a],
        l = Math.hypot(r.x - s.x, r.z - s.z);
      if (l > 24 || Math.abs(r.y - s.y) > 4) continue;
      let i = !0;
      const c = -(s.z - r.z) / (l || 1),
        d = (s.x - r.x) / (l || 1);
      for (const e of [0.5, 1.3])
        for (const n of [0, 0.3, -0.3])
          if (
            (t.set(r.x + c * n, r.y + e, r.z + d * n), o.set(s.x + c * n, s.y + e, s.z + d * n), !losClear(t, o, !1))
          ) {
            i = !1;
            break;
          }
      i && (r.n.push(a), s.n.push(n));
    }
  const n = new Int32Array(e.length).fill(-1);
  let a = -1,
    r = 0;
  for (let t = 0; t < e.length; t++) {
    if (n[t] >= 0) continue;
    let o = 0;
    const s = [t];
    for (n[t] = t; s.length;) {
      const a = s.pop();
      o++;
      for (const o of e[a].n) n[o] < 0 && ((n[o] = t), s.push(o));
    }
    o > r && ((r = o), (a = t));
  }
  if (r < e.length) {
    const t = new Int32Array(e.length).fill(-1),
      o = [];
    e.forEach((e, r) => {
      n[r] === a && ((t[r] = o.length), o.push(e));
    });
    for (const e of o) e.n = e.n.map(e => t[e]).filter(e => e >= 0);
    LV.wps = o;
  }
}
function navPath(e, t) {
  const o = LV.wps,
    n = o.length,
    a = new Float32Array(n).fill(1e9),
    r = new Int16Array(n).fill(-1),
    s = new Uint8Array(n);
  a[e] = 0;
  for (let e = 0; e < n; e++) {
    let e = -1,
      l = 1e9;
    for (let t = 0; t < n; t++) !s[t] && a[t] < l && ((l = a[t]), (e = t));
    if (e < 0 || e === t) break;
    s[e] = 1;
    for (const t of o[e].n) {
      const n = l + Math.hypot(o[e].x - o[t].x, o[e].z - o[t].z);
      n < a[t] && ((a[t] = n), (r[t] = e));
    }
  }
  if (a[t] >= 1e9) return null;
  const l = [];
  for (let e = t; -1 !== e; e = r[e]) l.unshift(e);
  return l;
}
function walkable(e, t) {
  const o = t.x - e.x,
    n = t.z - e.z,
    a = Math.hypot(o, n) || 1,
    r = -n / a,
    s = o / a,
    l = t.y || 0;
  for (const o of [0.5, 1.3])
    for (const n of [0, 0.32, -0.32])
      if (!losClear(V3(e.x + r * n, e.y + o, e.z + s * n), V3(t.x + r * n, l + o, t.z + s * n), !1)) return !1;
  return !0;
}
function nearestWp(e, t, o) {
  const n = V3(e, (o || 0) + 1, t),
    a = V3(),
    r = LV.wps
      .map((e, t) => t)
      .sort((o, n) => Math.hypot(LV.wps[o].x - e, LV.wps[o].z - t) - Math.hypot(LV.wps[n].x - e, LV.wps[n].z - t)),
    s = V3(e, o || 0, t);
  for (let e = 0; e < Math.min(8, r.length); e++) if (walkable(s, LV.wps[r[e]])) return r[e];
  for (let e = 0; e < Math.min(6, r.length); e++) {
    const t = LV.wps[r[e]];
    if ((a.set(t.x, t.y + 1, t.z), losClear(n, a, !1))) return r[e];
  }
  return r[0] || 0;
}
