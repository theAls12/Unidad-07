/* Texturas procedurales, PBR, sprites y anti-repetición */
const TEX = {},
  TEXFN = {
    concrete: {
      size: 512,
      nstr: 3,
      fn(e, t, o) {
        const n = nz.f(6 * e, 6 * t, 6, 6, 5),
          a = nz.f(2 * e + 0.3, 2 * t + 0.7, 2, 2, 4),
          r = nz.v(160 * e, 160 * t, 160),
          s = nz.cell(4 * e, 4 * t, 4),
          l = (1 - smooth(0, 0.03, s[1] - s[0])) * smooth(0.5, 0.62, nz.f(3 * e, 3 * t, 3, 3, 3)),
          i = 0.46 + 0.2 * (n - 0.5) - 0.15 * smooth(0.52, 0.8, a) + 0.07 * (r - 0.5) - 0.22 * l;
        ((o.r = 1.03 * i),
          (o.g = i),
          (o.b = 0.95 * i),
          (o.h = 0.5 * n + 0.25 * r - 0.6 * l),
          (o.ro = clamp(0.9 - 0.35 * smooth(0.55, 0.8, a) + 0.1 * (r - 0.5), 0.3, 1)));
      }
    },
    paint: {
      size: 512,
      nstr: 2.5,
      fn(e, t, o) {
        const n = 1 - t,
          a = nz.f(5 * e, 5 * t, 5, 5, 5),
          r = nz.f(3 * e + 0.5, 3 * t + 0.2, 3, 3, 6),
          s = nz.f(28 * e, 2 * t, 28, 2, 3),
          l = nz.v(200 * e, 200 * t, 200),
          i = smooth(0.61, 0.63, r),
          c = n < 0.32,
          d = Math.abs(n - 0.32) < 0.008,
          u = c ? [0.17, 0.29, 0.26] : [0.66, 0.69, 0.6],
          p = [0.42, 0.41, 0.39];
        let m = lerp(u[0], p[0], i),
          h = lerp(u[1], p[1], i),
          f = lerp(u[2], p[2], i);
        d && (m = h = f = 0.12);
        const g = 0.35 * smooth(0.3, 0, n) + 0.3 * smooth(0.5, 0.78, s) * (1 - 0.5 * n) + 0.18 * (a - 0.5);
        ((o.r = m * (1 - 0.85 * g) + 0.03 * (l - 0.5)),
          (o.g = h * (1 - g) + 0.03 * (l - 0.5)),
          (o.b = f * (1 - 1.1 * g) + 0.03 * (l - 0.5)));
        const v = smooth(0.58, 0.61, r) * (1 - i);
        ((o.h = 0.35 * (1 - i) + 0.45 * v + 0.15 * a + 0.05 * l), (o.ro = lerp(0.5, 0.93, i) + 0.2 * g));
      }
    },
    lino: {
      size: 512,
      nstr: 2,
      fn(e, t, o) {
        const n = Math.floor(8 * e),
          a = Math.floor(8 * t),
          r = fract(8 * e),
          s = fract(8 * t),
          l = hash2(n, a),
          i = nz.f(8 * e, 8 * t, 8, 8, 4),
          c = nz.f(2 * e + 0.3, 2 * t + 0.9, 2, 2, 5),
          d = nz.v(256 * e, 256 * t, 256),
          u = nz.f(40 * e, 5 * t, 40, 5, 3),
          p = Math.min(r, s, 1 - r, 1 - s) < 0.012,
          m = (n + a) & 1 ? [0.7, 0.68, 0.6] : [0.2, 0.23, 0.22],
          h = 0.07 * (l - 0.5),
          f = 0.55 * smooth(0.45, 0.8, c) + 0.15 * (i - 0.5);
        if (
          ((o.r = (m[0] + h) * (1 - 0.8 * f) + 0.04 * (d - 0.5)),
          (o.g = (m[1] + h) * (1 - 0.85 * f) + 0.04 * (d - 0.5)),
          (o.b = (m[2] + h) * (1 - 0.95 * f) + 0.04 * (d - 0.5)),
          (o.h = p ? 0 : 0.5 + 0.05 * d),
          (o.ro = clamp(0.32 + 0.6 * f + 0.18 * smooth(0.6, 0.8, u), 0.18, 1)),
          p && ((o.r *= 0.45), (o.g *= 0.45), (o.b *= 0.45), (o.ro = 0.9)),
          l < 0.07)
        ) {
          const e = 0.36 + 0.2 * (i - 0.5) + 0.12 * (d - 0.5);
          ((o.r = 1.02 * e), (o.g = e), (o.b = 0.94 * e), (o.h = 0.08 + 0.1 * d), (o.ro = 0.95));
        }
      }
    },
    ceiling: {
      size: 256,
      nstr: 3,
      fn(e, t, o) {
        const n = fract(2 * e),
          a = fract(2 * t),
          r = Math.min(n, a, 1 - n, 1 - a) < 0.02,
          s = nz.f(4 * e, 4 * t, 4, 4, 4),
          l = nz.f(2 * e + 0.3, 2 * t, 2, 2, 5),
          i = nz.v(90 * e, 90 * t, 90),
          c = 0.74 + 0.08 * (s - 0.5) - (i > 0.78 ? 0.2 : 0),
          d = smooth(0.52, 0.75, l);
        ((o.r = c - 0.2 * d),
          (o.g = c - 0.27 * d),
          (o.b = c - 0.4 * d),
          (o.h = 0.5 - (i > 0.78 ? 0.3 : 0) + 0.1 * s),
          (o.ro = 0.95),
          r && ((o.r = o.g = o.b = 0.5), (o.h = 0.85), (o.ro = 0.5), (o.me = 0.6)));
      }
    },
    locker: {
      size: 512,
      nstr: 3,
      metal: !0,
      fn(e, t, o) {
        const n = 1 - t,
          a = fract(4 * e),
          r = a < 0.035 || a > 0.965 || n < 0.03 || n > 0.97,
          s = n > 0.82 && n < 0.94 && fract(70 * n) < 0.45 && a > 0.25 && a < 0.75,
          l = a > 0.8 && a < 0.87 && n > 0.47 && n < 0.57,
          i = nz.f(8 * e, 8 * t, 8, 8, 4),
          c = nz.f(4 * e + 0.2, 4 * t, 4, 4, 6),
          d = nz.v(300 * e, 12 * t, 300, 12),
          u = nz.v(256 * e, 256 * t, 256),
          p = smooth(0.58, 0.72, c) * (0.5 + smooth(0.4, 0, n)),
          m = smooth(0.66, 0.7, c);
        let h = [0.22, 0.32, 0.4];
        const f = 1 - 0.25 * (i - 0.5);
        ((o.r = lerp(h[0] * f, 0.35, p)),
          (o.g = lerp(h[1] * f, 0.18, p)),
          (o.b = lerp(h[2] * f, 0.08, p)),
          d > 0.93 && !p && ((o.r += 0.18), (o.g += 0.18), (o.b += 0.18)),
          (o.me = m > 0.5 ? 1 : 0.25),
          m > 0.5 && (o.r = o.g = o.b = 0.48),
          (o.h = 0.6 + 0.05 * u - (r ? 0.3 : 0) - (s ? 0.45 : 0) + (l ? 0.3 : 0) - 0.1 * p),
          (o.ro = clamp(0.45 + 0.5 * p + 0.1 * (u - 0.5), 0.2, 1)),
          s && ((o.r *= 0.15), (o.g *= 0.15), (o.b *= 0.15)),
          l && ((o.r = o.g = o.b = 0.55), (o.me = 1), (o.ro = 0.3)));
      }
    },
    brick: {
      size: 512,
      nstr: 3.5,
      fn(e, t, o) {
        const n = 28 * t,
          a = Math.floor(n),
          r = 8 * e + 0.5 * (1 & a),
          s = Math.floor(r),
          l = fract(r),
          i = fract(n),
          c = l < 0.045 || i < 0.11,
          d = hash2(s + 31 * a, a),
          u = nz.f(16 * e, 16 * t, 16, 16, 4),
          p = nz.v(256 * e, 256 * t, 256),
          m = nz.f(3 * e, 3 * t, 3, 3, 5);
        if (c) {
          const e = 0.42 + 0.1 * (p - 0.5);
          ((o.r = e), (o.g = 0.97 * e), (o.b = 0.9 * e), (o.h = 0.1 + 0.1 * p), (o.ro = 0.95));
        } else {
          const e = 0.85 + 0.35 * (d - 0.5) + 0.2 * (u - 0.5);
          ((o.r = 0.46 * e),
            (o.g = 0.2 * e),
            (o.b = 0.14 * e),
            (o.h = 0.6 + 0.25 * u + 0.1 * p),
            (o.ro = 0.8 + 0.15 * (p - 0.5)),
            d > 0.93 && ((o.r *= 0.6), (o.g *= 0.6), (o.b *= 0.6)));
        }
        const h = 0.35 * smooth(0.5, 0.8, m);
        ((o.r *= 1 - h), (o.g *= 1 - h), (o.b *= 1 - h));
      }
    },
    asphalt: {
      size: 512,
      nstr: 2.5,
      fn(e, t, o) {
        const n = nz.f(8 * e, 8 * t, 8, 8, 5),
          a = nz.v(400 * e, 400 * t, 400),
          r = nz.v(120 * e, 120 * t, 120),
          s = nz.f(2 * e + 0.4, 2 * t + 0.1, 2, 2, 6),
          l = nz.cell(3 * e, 3 * t, 3),
          i = 1 - smooth(0, 0.025, l[1] - l[0]),
          c = smooth(0.58, 0.64, s);
        let d = 0.13 + 0.06 * (n - 0.5) + 0.08 * (a - 0.5) + (r > 0.75 ? 0.08 : 0) - 0.07 * i;
        ((d *= 1 - 0.35 * c),
          (o.r = d),
          (o.g = d),
          (o.b = 1.04 * d),
          (o.h = 0.5 + 0.4 * (a - 0.5) - 0.5 * i - 0.3 * c),
          (o.ro = lerp(clamp(0.85 + 0.1 * (a - 0.5), 0, 1), 0.05, c)));
      }
    },
    woodfloor: {
      size: 512,
      nstr: 1.5,
      fn(e, t, o) {
        const n = Math.floor(10 * t),
          a = fract(10 * t),
          r = Math.floor(2 * e + hash2(n, 3)),
          s = hash2(n, r),
          l = nz.f(3 * e + 9 * s, 80 * t, 3, 80, 4),
          i = (nz.f(6 * e, 6 * t, 6, 6, 4), nz.v(256 * e, 256 * t, 256)),
          c = nz.f(3 * e + 0.2, 3 * t, 3, 3, 5),
          d = 0.8 + 0.3 * (s - 0.5) + 0.35 * (l - 0.5),
          u = a < 0.03 || Math.abs(fract(2 * e + hash2(n, 3)) - 0) < 0.004;
        ((o.r = 0.55 * d), (o.g = 0.36 * d), (o.b = 0.2 * d));
        const p = smooth(0.5, 0.75, c);
        ((o.r = lerp(o.r, 0.4, 0.4 * p)),
          (o.g = lerp(o.g, 0.33, 0.4 * p)),
          (o.b = lerp(o.b, 0.25, 0.4 * p)),
          (o.h = u ? 0.1 : 0.6 + 0.1 * l + 0.05 * i),
          (o.ro = u ? 0.9 : clamp(0.35 + 0.4 * p + 0.1 * (i - 0.5), 0.2, 1)),
          u && ((o.r *= 0.4), (o.g *= 0.4), (o.b *= 0.4)));
      }
    },
    logs: {
      size: 512,
      nstr: 3,
      fn(e, t, o) {
        const n = 8 * t,
          a = Math.floor(n),
          r = fract(n),
          s = hash2(a, 7),
          l = Math.sqrt(Math.max(0, 1 - Math.pow(2.1 * (r - 0.5), 2))),
          i = nz.f(2 * e + 10 * s, 60 * t, 2, 60, 4),
          c = nz.v(30 * e, 240 * t, 30, 240),
          d = nz.v(256 * e, 256 * t, 256),
          u = nz.f(3 * e, 3 * t, 3, 3, 4),
          p = l < 0.25;
        let m = (0.55 + 0.45 * l) * (0.75 + 0.4 * i) * (1 - 0.3 * smooth(0.5, 0.8, u));
        if (
          ((o.r = 0.42 * m),
          (o.g = 0.3 * m),
          (o.b = 0.2 * m),
          c > 0.85 && ((o.r *= 0.6), (o.g *= 0.6), (o.b *= 0.6)),
          p)
        ) {
          const e = 0.5 + 0.1 * d;
          ((o.r = e), (o.g = 0.96 * e), (o.b = 0.9 * e));
        }
        ((o.h = 0.8 * l + 0.1 * i - (c > 0.85 ? 0.1 : 0)), (o.ro = 0.85 + 0.1 * (d - 0.5)));
      }
    },
    planks: {
      size: 256,
      nstr: 2,
      fn(e, t, o) {
        const n = Math.floor(5 * e),
          a = fract(5 * e),
          r = hash2(n, 1.7),
          s = nz.f(40 * e, 2 * t + 7 * r, 40, 2, 4),
          l = nz.f(5 * e, 5 * t, 5, 5, 4),
          i = nz.v(256 * e, 256 * t, 256),
          c = fract(2 * t) < 0.03 && Math.abs(a - 0.5) < 0.05,
          d = a < 0.035,
          u = 0.75 + 0.35 * (r - 0.5) + 0.4 * (s - 0.5) - 0.2 * smooth(0.5, 0.8, l);
        ((o.r = 0.47 * u),
          (o.g = 0.36 * u),
          (o.b = 0.25 * u),
          (o.h = d ? 0 : 0.6 + 0.15 * s),
          (o.ro = 0.85 + 0.1 * (i - 0.5)),
          d && ((o.r *= 0.3), (o.g *= 0.3), (o.b *= 0.3)),
          c && ((o.r = o.g = o.b = 0.2), (o.me = 1), (o.ro = 0.5)));
      }
    },
    bark: {
      size: 256,
      nstr: 4,
      fn(e, t, o) {
        const n = nz.f(8 * e, 2 * t, 8, 2, 5),
          a = nz.f(24 * e, 4 * t, 24, 4, 4),
          r = nz.v(256 * e, 256 * t, 256),
          s = nz.f(2 * e, 2 * t, 2, 2, 4),
          l = 0.6 * smooth(0.35, 0.65, n) + 0.4 * a,
          i = 0.35 + 0.5 * l;
        ((o.r = 0.3 * i), (o.g = 0.24 * i), (o.b = 0.19 * i));
        const c = smooth(0.62, 0.75, s);
        ((o.r = lerp(o.r, 0.18, c)),
          (o.g = lerp(o.g, 0.24, c)),
          (o.b = lerp(o.b, 0.1, c)),
          (o.h = l + 0.08 * r),
          (o.ro = 0.92));
      }
    },
    ground: {
      size: 512,
      nstr: 3,
      fn(e, t, o) {
        const n = nz.f(6 * e, 6 * t, 6, 6, 5),
          a = nz.f(3 * e + 0.4, 3 * t, 3, 3, 5),
          r = nz.v(300 * e, 300 * t, 300),
          s = nz.v(180 * e, 18 * t, 180, 18),
          l = nz.v(18 * e, 180 * t, 18, 180),
          i = smooth(0.58, 0.7, a),
          c = Math.max(s, l) > 0.8,
          d = nz.cell(20 * e, 20 * t, 20),
          u = d[0] < 0.18 && hash2(d[2], 1) > 0.7;
        let p = 0.26,
          m = 0.19,
          h = 0.12;
        const f = 0.8 + 0.5 * (n - 0.5);
        if (
          ((p *= f),
          (m *= f),
          (h *= f),
          c && ((p = 0.3), (m = 0.22), (h = 0.13)),
          (p = lerp(p, 0.16, i)),
          (m = lerp(m, 0.22, i)),
          (h = lerp(h, 0.08, i)),
          u)
        ) {
          const e = 0.42 + 0.1 * (r - 0.5);
          ((p = e), (m = 0.98 * e), (h = 0.94 * e));
        }
        ((o.r = p + 0.04 * (r - 0.5)),
          (o.g = m + 0.04 * (r - 0.5)),
          (o.b = h + 0.03 * (r - 0.5)),
          (o.h = 0.4 * n + (c ? 0.15 : 0) + (u ? 0.4 - d[0] : 0) + 0.1 * r),
          (o.ro = u ? 0.7 : 0.95));
      }
    },
    sand: {
      size: 512,
      nstr: 2.2,
      fn(e, t, o) {
        const n = nz.f(4 * e, 4 * t, 4, 4, 5),
          a = nz.v(400 * e, 400 * t, 400),
          r = nz.f(3 * e, 3 * t, 3, 3, 4),
          s = 0.5 * Math.sin((40 * t + 6 * r) * TAU * 0.5) + 0.5,
          l = nz.v(90 * e, 90 * t, 90),
          i = 0.92 + 0.18 * (n - 0.5) + 0.12 * (a - 0.5);
        ((o.r = 0.78 * i),
          (o.g = 0.64 * i),
          (o.b = 0.46 * i),
          l > 0.82 && ((o.r *= 0.8), (o.g *= 0.78), (o.b *= 0.75)),
          (o.h = 0.35 * s + 0.3 * n + 0.15 * a),
          (o.ro = 0.93));
      }
    },
    adobe: {
      size: 512,
      nstr: 3,
      fn(e, t, o) {
        const n = 1 - t,
          a = nz.f(5 * e, 5 * t, 5, 5, 5),
          r = nz.f(3 * e + 0.6, 3 * t + 0.1, 3, 3, 6),
          s = nz.v(256 * e, 256 * t, 256),
          l = smooth(0.64, 0.66, r),
          i = 12 * t,
          c = Math.floor(i),
          d = 6 * e + 0.5 * (1 & c),
          u = fract(d) < 0.05 || fract(i) < 0.1,
          p = nz.cell(4 * e, 4 * t, 4),
          m = (1 - smooth(0, 0.02, p[1] - p[0])) * smooth(0.55, 0.65, nz.f(2 * e, 2 * t, 2, 2, 3));
        let h = 0.74,
          f = 0.6,
          g = 0.45;
        const v = 1 + 0.22 * (a - 0.5);
        if (((h *= v), (f *= v), (g *= v), l > 0.5)) {
          const e = hash2(Math.floor(d), c);
          ((h = 0.55 + 0.08 * e), (f = 0.4 + 0.05 * e), (g = 0.28), u && ((h = 0.48), (f = 0.4), (g = 0.3)));
        }
        const T = 0.3 * smooth(0.25, 0, n);
        ((h *= 1 - T - 0.3 * m),
          (f *= 1 - T - 0.32 * m),
          (g *= 1 - T - 0.34 * m),
          (o.r = h + 0.05 * (s - 0.5)),
          (o.g = f + 0.05 * (s - 0.5)),
          (o.b = g + 0.04 * (s - 0.5)),
          (o.h = 0.4 * (1 - l) + 0.2 * a + 0.1 * s - 0.4 * m - (l > 0.5 && u ? 0.15 : 0)),
          (o.ro = 0.9));
      }
    },
    rust: {
      size: 256,
      nstr: 3,
      metal: !0,
      fn(e, t, o) {
        const n = nz.f(4 * e, 4 * t, 4, 4, 6),
          a = nz.v(256 * e, 256 * t, 256),
          r = nz.f(3 * e + 0.5, 3 * t, 3, 3, 5),
          s = smooth(0.55, 0.6, r),
          l = 0.7 + 0.6 * (n - 0.5);
        ((o.r = 0.36 * l),
          (o.g = 0.17 * l),
          (o.b = 0.08 * l),
          (o.me = 0.35),
          (o.ro = 0.85 + 0.15 * (a - 0.5)),
          s > 0.5 && ((o.r = 0.32), (o.g = 0.36), (o.b = 0.3), (o.me = 0.1), (o.ro = 0.6)),
          (o.h = 0.6 * n + 0.25 * a + (s > 0.5 ? 0.1 : 0)));
      }
    },
    corr: {
      size: 256,
      nstr: 2.5,
      metal: !0,
      fn(e, t, o) {
        const n = 0.5 * Math.sin(e * TAU * 10) + 0.5,
          a = nz.f(4 * e, 4 * t, 4, 4, 6),
          r = nz.v(256 * e, 256 * t, 256),
          s = smooth(0.5, 0.7, a + 0.15 * (1 - t));
        ((o.r = lerp(0.48, 0.36, s)),
          (o.g = lerp(0.48, 0.18, s)),
          (o.b = lerp(0.46, 0.08, s)),
          (o.me = lerp(0.85, 0.3, s)),
          (o.ro = lerp(0.45, 0.9, s) + 0.1 * (r - 0.5)),
          (o.h = 0.8 * n + 0.1 * r));
      }
    },
    cloth: {
      size: 256,
      nstr: 1.5,
      fn(e, t, o) {
        const n = 0.5 * Math.sin(e * TAU * 64) + 0.5,
          a = 0.5 * Math.sin(t * TAU * 64) + 0.5,
          r = nz.f(3 * e, 3 * t, 3, 3, 5),
          s = nz.v(256 * e, 256 * t, 256),
          l = 0.82 + 0.3 * (r - 0.5) + 0.1 * (n * a - 0.25);
        ((o.r = o.g = o.b = l), (o.h = 0.5 * n + 0.5 * a + 0.1 * s), (o.ro = 0.95));
      }
    },
    fabric: {
      size: 256,
      nstr: 2,
      fn(e, t, o) {
        const n = Math.sin(e * TAU * 96) * Math.sin(t * TAU * 96),
          a = nz.f(4 * e, 4 * t, 4, 4, 5),
          r = nz.f(2 * e + 0.7, 2 * t, 2, 2, 5),
          s = nz.v(256 * e, 256 * t, 256),
          l = 0.8 + 0.25 * (a - 0.5) - 0.25 * smooth(0.55, 0.75, r) + 0.04 * n;
        ((o.r = o.g = o.b = l), (o.h = 0.3 * n + 0.3 * a + 0.1 * s), (o.ro = 0.9));
      }
    },
    gunmetal: {
      size: 256,
      nstr: 1,
      metal: !0,
      fn(e, t, o) {
        const n = nz.v(2 * e, 256 * t, 2, 256),
          a = nz.f(6 * e, 6 * t, 6, 6, 4),
          r = nz.f(5 * e + 0.3, 5 * t, 5, 5, 5),
          s = smooth(0.65, 0.75, r),
          l = 0.13 + 0.035 * n + 0.03 * (a - 0.5);
        ((o.r = lerp(l, 0.42, s)),
          (o.g = lerp(l, 0.42, s)),
          (o.b = lerp(1.1 * l, 0.44, s)),
          (o.me = lerp(0.55, 1, s)),
          (o.ro = lerp(0.42, 0.28, s) + 0.08 * n),
          (o.h = 0.2 * n + 0.1 * a));
      }
    },
    polymer: {
      size: 256,
      nstr: 2.5,
      fn(e, t, o) {
        const n = nz.v(180 * e, 180 * t, 180),
          a = nz.f(4 * e, 4 * t, 4, 4, 4),
          r = nz.f(4 * e + 0.3, 4 * t, 4, 4, 5),
          s = 0.1 + 0.025 * (a - 0.5) + 0.09 * smooth(0.65, 0.8, r);
        ((o.r = s), (o.g = s), (o.b = 1.05 * s), (o.h = 0.6 * n + 0.2 * a), (o.ro = 0.7 + 0.15 * n));
      }
    },
    rock: {
      size: 256,
      nstr: 4,
      fn(e, t, o) {
        const n = nz.f(5 * e, 5 * t, 5, 5, 6),
          a = nz.cell(6 * e, 6 * t, 6),
          r = nz.v(256 * e, 256 * t, 256),
          s = nz.f(6 * e + 0.2, 6 * t, 6, 6, 4),
          l = 0.42 + 0.3 * (n - 0.5) + 0.1 * (r - 0.5);
        ((o.r = l), (o.g = 0.98 * l), (o.b = 0.94 * l));
        const i = smooth(0.62, 0.7, s);
        ((o.r = lerp(o.r, 0.5, i)),
          (o.g = lerp(o.g, 0.52, i)),
          (o.b = lerp(o.b, 0.32, i)),
          (o.h = 0.6 * n + 0.3 * a[0] + 0.1 * r),
          (o.ro = 0.85));
      }
    },
    needles: {
      size: 256,
      nstr: 3,
      fn(e, t, o) {
        const n = nz.v(120 * e, 12 * t, 120, 12),
          a = nz.v(12 * e, 120 * t, 12, 120),
          r = nz.f(4 * e, 4 * t, 4, 4, 4),
          s = nz.v(256 * e, 256 * t, 256),
          l = Math.max(n, a),
          i = 0.55 + 0.6 * l + 0.3 * (r - 0.5);
        ((o.r = 0.06 * i), (o.g = 0.13 * i), (o.b = 0.07 * i), (o.h = 0.7 * l + 0.2 * s), (o.ro = 0.85));
      }
    },
    chalk: {
      size: 256,
      nstr: 1,
      fn(e, t, o) {
        const n = nz.f(3 * e, 3 * t, 3, 3, 6),
          a = nz.f(12 * e, 3 * t, 12, 3, 4),
          r = 0.6 + 0.3 * (n - 0.5) + 0.6 * smooth(0.6, 0.75, a);
        ((o.r = 0.08 * r), (o.g = 0.15 * r), (o.b = 0.12 * r), (o.h = 0.2 * n), (o.ro = 0.9));
      }
    }
  };
function genPBR(e) {
  if (TEX[e]) return TEX[e];
  const t = TEXFN[e],
    o = t.size * (void 0 !== Q && Q.tex ? Q.tex : 1),
    n = o * o,
    a = new Uint8ClampedArray(4 * n),
    r = new Uint8ClampedArray(4 * n),
    s = new Uint8ClampedArray(4 * n),
    l = new Float32Array(n),
    i = { r: 0.5, g: 0.5, b: 0.5, h: 0.5, ro: 0.8, me: 0 };
  for (let e = 0; e < o; e++)
    for (let n = 0; n < o; n++) {
      ((i.me = 0), t.fn(n / o, e / o, i));
      const r = e * o + n,
        c = 4 * r;
      ((a[c] = 255 * i.r),
        (a[c + 1] = 255 * i.g),
        (a[c + 2] = 255 * i.b),
        (a[c + 3] = 255),
        (l[r] = i.h),
        (s[c] = 255),
        (s[c + 1] = 255 * clamp(i.ro, 0.04, 1)),
        (s[c + 2] = 255 * i.me),
        (s[c + 3] = 255));
    }
  const c = (t.nstr * o) / 256;
  for (let e = 0; e < o; e++)
    for (let t = 0; t < o; t++) {
      const n = l[e * o + ((t - 1 + o) % o)],
        a = l[e * o + ((t + 1) % o)],
        s = l[((e - 1 + o) % o) * o + t],
        i = (n - a) * c,
        d = (l[((e + 1) % o) * o + t] - s) * c,
        u = Math.sqrt(i * i + d * d + 1),
        p = 4 * (e * o + t);
      ((r[p] = 255 * ((i / u) * 0.5 + 0.5)),
        (r[p + 1] = 255 * ((d / u) * 0.5 + 0.5)),
        (r[p + 2] = 255 * ((1 / u) * 0.5 + 0.5)),
        (r[p + 3] = 255));
    }
  const d = (e, t) => {
    const n = document.createElement('canvas');
    ((n.width = n.height = o), n.getContext('2d').putImageData(new ImageData(e, o, o), 0, 0));
    const a = new THREE.CanvasTexture(n);
    return (
      (a.wrapS = a.wrapT = THREE.RepeatWrapping),
      (a.anisotropy = maxAniso),
      t && (a.encoding = THREE.sRGBEncoding),
      a
    );
  };
  return (TEX[e] = { map: d(a, !0), normalMap: d(r), rm: d(s), metal: !!t.metal });
}
function canvasTex(e, t, o = !0, n = e) {
  const a = document.createElement('canvas');
  ((a.width = e), (a.height = n), t(a.getContext('2d'), e, n));
  const r = new THREE.CanvasTexture(a);
  return (o && (r.encoding = THREE.sRGBEncoding), (r.anisotropy = maxAniso), r);
}
const SPR = {};
function initSprites() {
  ((SPR.glow = canvasTex(64, (e, t) => {
    const o = e.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
    (o.addColorStop(0, 'rgba(255,255,255,1)'),
      o.addColorStop(0.25, 'rgba(255,255,255,.6)'),
      o.addColorStop(1, 'rgba(255,255,255,0)'),
      (e.fillStyle = o),
      e.fillRect(0, 0, t, t));
  })),
    (SPR.smoke = canvasTex(128, (e, t) => {
      for (let o = 0; o < 26; o++) {
        const o = t / 2 + rand(-26, 26),
          n = t / 2 + rand(-26, 26),
          a = rand(14, 40),
          r = e.createRadialGradient(o, n, 0, o, n, a);
        (r.addColorStop(0, 'rgba(255,255,255,.22)'),
          r.addColorStop(1, 'rgba(255,255,255,0)'),
          (e.fillStyle = r),
          e.fillRect(0, 0, t, t));
      }
    })),
    (SPR.flash = canvasTex(128, (e, t) => {
      e.translate(t / 2, t / 2);
      for (let t = 0; t < 7; t++) {
        e.rotate(TAU / 7 + rand(-0.2, 0.2));
        const t = rand(34, 62),
          o = e.createLinearGradient(0, 0, t, 0);
        (o.addColorStop(0, 'rgba(255,240,200,1)'),
          o.addColorStop(1, 'rgba(255,140,40,0)'),
          (e.fillStyle = o),
          e.beginPath(),
          e.moveTo(0, -5),
          e.lineTo(t, 0),
          e.lineTo(0, 5),
          e.fill());
      }
      const o = e.createRadialGradient(0, 0, 0, 0, 0, 26);
      (o.addColorStop(0, 'rgba(255,255,240,1)'),
        o.addColorStop(1, 'rgba(255,170,60,0)'),
        (e.fillStyle = o),
        e.fillRect(-30, -30, 60, 60));
    })),
    (SPR.spark = canvasTex(32, (e, t) => {
      const o = e.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
      (o.addColorStop(0, 'rgba(255,250,220,1)'),
        o.addColorStop(0.3, 'rgba(255,180,80,.8)'),
        o.addColorStop(1, 'rgba(255,120,0,0)'),
        (e.fillStyle = o),
        e.fillRect(0, 0, t, t));
    })),
    (SPR.hole = canvasTex(64, (e, t) => {
      const o = t / 2;
      for (let t = 0; t < 10; t++)
        ((e.fillStyle = `rgba(${0 | rand(60, 110)},${0 | rand(60, 100)},${0 | rand(55, 90)},${rand(0.25, 0.6)})`),
          e.beginPath(),
          e.arc(o + rand(-9, 9), o + rand(-9, 9), rand(3, 8), 0, TAU),
          e.fill());
      const n = e.createRadialGradient(o, o, 0, o, o, 9);
      (n.addColorStop(0, 'rgba(5,5,5,1)'),
        n.addColorStop(0.6, 'rgba(20,18,16,.9)'),
        n.addColorStop(1, 'rgba(20,18,16,0)'),
        (e.fillStyle = n),
        e.fillRect(0, 0, t, t));
    })),
    (SPR.blood = canvasTex(128, (e, t) => {
      const o = t / 2;
      for (let t = 0; t < 40; t++) {
        const t = rand(0, TAU),
          n = 50 * Math.pow(Math.random(), 1.6);
        ((e.fillStyle = `rgba(${0 | rand(70, 110)},${0 | rand(4, 12)},${0 | rand(4, 10)},${rand(0.6, 0.95)})`),
          e.beginPath(),
          e.arc(o + Math.cos(t) * n, o + Math.sin(t) * n, rand(1.5, 9) * (1 - n / 70), 0, TAU),
          e.fill());
      }
    })),
    (SPR.grass = canvasTex(128, (e, t) => {
      for (let o = 0; o < 60; o++) {
        const o = rand(8, t - 8),
          n = rand(0.4 * t, 0.95 * t),
          a = rand(-18, 18),
          r = rand(0.5, 1);
        ((e.strokeStyle = `rgba(${(70 * r) | 0},${(95 * r) | 0},${(38 * r) | 0},1)`),
          Math.random() < 0.25 && (e.strokeStyle = `rgba(${(120 * r) | 0},${(110 * r) | 0},${(60 * r) | 0},1)`),
          (e.lineWidth = rand(1.2, 2.6)),
          e.beginPath(),
          e.moveTo(o, t),
          e.quadraticCurveTo(o + 0.3 * a, t - 0.6 * n, o + a, t - n),
          e.stroke());
      }
    })),
    (SPR.fern = canvasTex(128, (e, t) => {
      e.translate(t / 2, t);
      for (let t = 0; t < 5; t++) {
        (e.save(), e.rotate(rand(-0.9, 0.9)));
        const t = rand(70, 115);
        ((e.strokeStyle = 'rgb(40,62,24)'),
          (e.lineWidth = 1.6),
          e.beginPath(),
          e.moveTo(0, 0),
          e.lineTo(0, -t),
          e.stroke());
        for (let o = 6; o < t; o += 5) {
          const n = 20 * (1 - o / t) + 3;
          ((e.fillStyle = `rgb(${(45 + rand(0, 20)) | 0},${(70 + rand(0, 25)) | 0},${(26 + rand(0, 10)) | 0})`),
            e.beginPath(),
            e.ellipse(-n / 2, -o, n / 2, 2.2, -0.3, 0, TAU),
            e.fill(),
            e.beginPath(),
            e.ellipse(n / 2, -o, n / 2, 2.2, 0.3, 0, TAU),
            e.fill());
        }
        e.restore();
      }
    })),
    (SPR.frond = canvasTex(
      64,
      (e, t, o) => {
        ((e.strokeStyle = 'rgb(92,84,40)'),
          (e.lineWidth = 2),
          e.beginPath(),
          e.moveTo(t / 2, 0),
          e.lineTo(t / 2, o),
          e.stroke());
        for (let n = 6; n < o; n += 4) {
          const a = 28 * Math.sin((n / o) * Math.PI) + 4,
            r = rand(0.7, 1);
          ((e.strokeStyle = `rgb(${(70 * r) | 0},${(92 * r) | 0},${(35 * r) | 0})`),
            (e.lineWidth = 2.2),
            e.beginPath(),
            e.moveTo(t / 2, n),
            e.lineTo(t / 2 - a, n + 9),
            e.moveTo(t / 2, n),
            e.lineTo(t / 2 + a, n + 9),
            e.stroke());
        }
      },
      !0,
      256
    )),
    (SPR.chain = canvasTex(64, (e, t) => {
      ((e.strokeStyle = 'rgba(150,155,150,1)'), (e.lineWidth = 2));
      for (let t = -2; t < 4; t++)
        (e.beginPath(),
          e.moveTo(16 * t, 0),
          e.lineTo(16 * t + 64, 64),
          e.stroke(),
          e.beginPath(),
          e.moveTo(16 * t + 64, 0),
          e.lineTo(16 * t, 64),
          e.stroke());
    })),
    (SPR.chain.wrapS = SPR.chain.wrapT = THREE.RepeatWrapping),
    (SPR.paper = canvasTex(64, (e, t) => {
      ((e.fillStyle = '#d9d4c4'), e.fillRect(0, 0, t, t), (e.fillStyle = 'rgba(60,70,110,.5)'));
      for (let o = 10; o < t; o += 6) e.fillRect(6, o, t - 12, 1);
      ((e.fillStyle = 'rgba(120,90,40,.25)'),
        e.beginPath(),
        e.arc(rand(10, 50), rand(10, 50), rand(8, 18), 0, TAU),
        e.fill());
    })),
    (SPR.dust = canvasTex(32, (e, t) => {
      const o = e.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
      (o.addColorStop(0, 'rgba(255,255,255,.9)'),
        o.addColorStop(1, 'rgba(255,255,255,0)'),
        (e.fillStyle = o),
        e.fillRect(0, 0, t, t));
    })));
}
function signTex(e, t, o, n = 256, a = 96, r = 'bold 54px Arial') {
  return canvasTex(
    n,
    s => {
      ((s.fillStyle = t),
        s.fillRect(0, 0, n, a),
        (s.fillStyle = o),
        (s.font = r),
        (s.textAlign = 'center'),
        (s.textBaseline = 'middle'),
        s.fillText(e, n / 2, a / 2 + 2));
    },
    !0,
    a
  );
}
const NT_GLSL =
    '\nvarying vec3 vNtW;\nvec2 ntA, ntB; float ntW, ntM;\nfloat ntH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat ntN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);\n  return mix(mix(ntH(i), ntH(i + vec2(1.0, 0.0)), f.x), mix(ntH(i + vec2(0.0, 1.0)), ntH(i + 1.0), f.x), f.y); }\nvec4 ntTex(sampler2D s, vec2 uv){\n#ifdef NT_OFF\n  vec2 dx = dFdx(uv), dy = dFdy(uv);\n  return mix(textureGrad(s, uv + ntA, dx, dy), textureGrad(s, uv + ntB, dx, dy), ntW);\n#else\n  return texture2D(s, uv);\n#endif\n}\n',
  NT_INIT =
    '\n#ifdef NT_OFF\n  { float k = ntN(vUv * 0.42) * 8.0, ia = floor(k);\n    ntW = smoothstep(0.3, 0.7, fract(k));\n    ntA = sin(vec2(3.0, 7.0) * ia) * 4.0; ntB = sin(vec2(3.0, 7.0) * (ia + 1.0)) * 4.0;\n  #ifdef NT_U\n    ntA.y = 0.0; ntB.y = 0.0;\n  #endif\n  #ifdef NT_STEP\n    ntA = floor(ntA / NT_STEP) * NT_STEP; ntB = floor(ntB / NT_STEP) * NT_STEP;\n  #endif\n  }\n#endif\n  ntM = ntN(vNtW.xz * 0.25 + vNtW.y * 0.17) * 0.55 + ntN(vNtW.xz * 0.07 - vNtW.y * 0.05 + 17.0) * 0.45;\n';
let NT_OK = null;
function noTile(e, t) {
  if (!t || window.__noNT) return e;
  null === NT_OK && (NT_OK = void 0 !== renderer && renderer.capabilities.isWebGL2);
  const o = NT_OK && 'macro' !== t && 'low' !== G.quality,
    n = null != e.userData.ntMac ? e.userData.ntMac : 0.22,
    a = e.userData.ntMix;
  return (
    (e.onBeforeCompile = e => {
      (o && (e.defines.NT_OFF = ''),
        'u' === t && (e.defines.NT_U = ''),
        'number' == typeof t && (e.defines.NT_STEP = t.toFixed(5)),
        a && ((e.defines.NT_MIX = ''), (e.uniforms.ntMap2 = { value: a })),
        (e.vertexShader = e.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vNtW;')
          .replace(
            '#include <project_vertex>',
            '#include <project_vertex>\n#ifdef USE_INSTANCING\n  vNtW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\n  vNtW = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif'
          )));
      const r = (e, t) => THREE.ShaderChunk[e].split(`texture2D( ${t}, vUv`).join(`ntTex( ${t}, vUv`);
      e.fragmentShader = e.fragmentShader
        .replace('#include <common>', '#include <common>\n' + (a ? 'uniform sampler2D ntMap2;\n' : '') + NT_GLSL)
        .replace('#include <bumpmap_pars_fragment>', r('bumpmap_pars_fragment', 'bumpMap'))
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + NT_INIT)
        .replace(
          '#include <map_fragment>',
          r('map_fragment', 'map') +
            `\n  diffuseColor.rgb *= mix(1.0 - ${(0.6 * n).toFixed(3)}, 1.0 + ${(0.6 * n).toFixed(3)}, ntM); // centred: no overall darkening\n#ifdef NT_MIX\n  { vec3 b2 = mapTexelToLinear(ntTex(ntMap2, vUv * 1.37)).rgb;\n    float w2 = smoothstep(0.45, 0.68, ntN(vNtW.xz * 0.33 + 5.0) * 0.55 + ntN(vNtW.xz * 1.7) * 0.15 + ntM * 0.3);\n    diffuseColor.rgb = mix(diffuseColor.rgb, b2 * (0.75 + 0.5 * ntM), w2); }\n#endif`
        )
        .replace(
          '#include <roughnessmap_fragment>',
          r('roughnessmap_fragment', 'roughnessMap') +
            '\n  roughnessFactor = clamp(roughnessFactor + (ntM - 0.5) * 0.3, 0.04, 1.0);'
        )
        .replace('#include <metalnessmap_fragment>', r('metalnessmap_fragment', 'metalnessMap'))
        .replace('#include <normal_fragment_maps>', r('normal_fragment_maps', 'normalMap'));
    }),
    (e.customProgramCacheKey = () => 'nt' + t + (o ? 1 : 0) + n + (a ? 'm' : '')),
    (e.userData.nt = t),
    e
  );
}
