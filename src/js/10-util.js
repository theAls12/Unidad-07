/* Utilidades: matemáticas, ruido y aleatoriedad */
const TAU = 2 * Math.PI,
  $ = e => document.querySelector(e);
let RNG = Math.random;
const rand = (e, t) => e + RNG() * (t - e),
  pick = e => e[(RNG() * e.length) | 0],
  clamp = (e, t, o) => (e < t ? t : e > o ? o : e),
  lerp = (e, t, o) => e + (t - e) * o,
  fract = e => e - Math.floor(e),
  smooth = (e, t, o) => {
    const n = clamp((o - e) / (t - e), 0, 1);
    return n * n * (3 - 2 * n);
  },
  approach = (e, t, o) => (e < t ? Math.min(t, e + o) : Math.max(t, e - o)),
  angDiff = (e, t) => {
    let o = (t - e) % TAU;
    return (o > Math.PI && (o -= TAU), o < -Math.PI && (o += TAU), o);
  },
  V3 = (e = 0, t = 0, o = 0) => new THREE.Vector3(e, t, o),
  hash2 = (e, t) => fract(43758.5453 * Math.sin(127.1 * e + 311.7 * t)),
  r2 = e => Math.round(100 * e) / 100;
function Noise(e) {
  let t = e >>> 0;
  const o = () => (t = (Math.imul(t, 1664525) + 1013904223) >>> 0) / 4294967296,
    n = new Uint16Array(512),
    a = new Float32Array(256),
    r = new Float32Array(512),
    s = [];
  for (let e = 0; e < 256; e++) s.push(e);
  for (let e = 255; e > 0; e--) {
    const t = (o() * (e + 1)) | 0,
      n = s[e];
    ((s[e] = s[t]), (s[t] = n));
  }
  for (let e = 0; e < 512; e++) ((n[e] = s[255 & e]), (r[e] = o()));
  for (let e = 0; e < 256; e++) a[e] = o();
  const l = (e, t) => n[n[255 & e] + (255 & t)],
    i = (e, t) => ((e % t) + t) % t;
  function c(e, t, o = 4096, n = o) {
    const r = Math.floor(e),
      s = Math.floor(t),
      c = e - r,
      d = t - s,
      u = i(r, o),
      p = i(s, n),
      m = (u + 1) % o,
      h = (p + 1) % n,
      f = c * c * (3 - 2 * c),
      g = d * d * (3 - 2 * d),
      v = a[l(u, p)],
      T = a[l(m, p)],
      b = a[l(u, h)];
    return v + (T - v) * f + (b - v) * g + (v - T - b + a[l(m, h)]) * f * g;
  }
  const d = [0, 0, 0];
  return {
    v: c,
    f: function (e, t, o, n, a = 5, r = 0.5) {
      let s = 1,
        l = 1,
        i = 0,
        d = 0;
      for (let u = 0; u < a; u++)
        ((i += s * c(e * l + 17 * u, t * l + 9 * u, o * l, n * l)), (d += s), (s *= r), (l *= 2));
      return i / d;
    },
    cell: function (e, t, o) {
      const n = Math.floor(e),
        a = Math.floor(t);
      let s = 9,
        c = 9,
        u = 0;
      for (let d = -1; d <= 1; d++)
        for (let p = -1; p <= 1; p++) {
          const m = n + p,
            h = a + d,
            f = l(i(m, o), i(h, o)),
            g = m + r[2 * f] - e,
            v = h + r[2 * f + 1] - t,
            T = Math.sqrt(g * g + v * v);
          T < s ? ((c = s), (s = T), (u = f)) : T < c && (c = T);
        }
      return ((d[0] = s), (d[1] = c), (d[2] = u / 255), d);
    },
    rnd: o
  };
}
const NZ = Noise(1337),
  nz = NZ,
  V2 = (e, t) => new THREE.Vector2(e, t);
