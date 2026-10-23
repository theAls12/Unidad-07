/* Mapa: pueblo del desierto */
function buildDesert() {
  ((LV.name = 'desert'), (LV.bounds = 88), (LV.tsurf = 'sand'));
  const e = (e, t) => {
    const o = Math.hypot(e, t);
    let n = 0.12 * (nz.v(0.15 * e, 0.15 * t) - 0.5);
    n += smooth(46, 72, o) * (9 * (nz.v(0.025 * e + 7, 0.025 * t + 1) - 0.3) + 3);
    const a = Math.max(Math.abs(e), Math.abs(t));
    return ((n += 10 * smooth(76, 96, a)), n);
  };
  LV.terrain = e;
  const t = new THREE.PlaneGeometry(220, 220, 170, 170);
  t.rotateX(-Math.PI / 2);
  const o = t.attributes.position,
    n = t.attributes.uv;
  for (let t = 0; t < o.count; t++) {
    const a = o.getX(t),
      r = o.getZ(t);
    (o.setY(t, e(a, r)), n.setXY(t, a / 5, r / 5));
  }
  (t.computeVertexNormals(),
    mesh(t, M('sand'), 0, 0, 0, { cast: !1 }),
    addBox(0, -0.25, 0, 22, 0.27, 22, 'concrete', { cast: !1, surf: 'concrete' }));
  const a = (e, t, o, n, a, r, s = {}) => {
      const l = s.mk || 'adobe',
        i = o / 2,
        c = n / 2,
        d = { n: [], s: [], e: [], w: [] };
      d[r].push(DOOR(('n' === r || 's' === r ? o : n) / 2 - 0.55 + (s.doff || 0), 1.1, 2.1));
      for (const e of ['n', 's', 'e', 'w']) {
        const t = 'n' === e || 's' === e ? o : n;
        (e !== r && t > 5 && RNG() < 0.85 && d[e].push(WIN(0.25 * t, 0.9, 1.2, 2.1)),
          t > 7 && RNG() < 0.6 && d[e].push(WIN(0.72 * t, 0.9, 1.2, 2.1)));
      }
      (s.extraDoor && d[s.extraDoor].push(DOOR(1, 1, 2.1)),
        wall(e - i, t + c, e + i, t + c, { h: a, t: 0.4, mk: l, ops: d.n }),
        wall(e - i, t - c, e + i, t - c, { h: a, t: 0.4, mk: l, ops: d.s }),
        wall(e + i, t - c, e + i, t + c, { h: a, t: 0.4, mk: l, ops: d.e }),
        wall(e - i, t - c, e - i, t + c, { h: a, t: 0.4, mk: l, ops: d.w }),
        addBox(e, a, t, o + 0.4, 0.28, n + 0.4, l));
      const u = a + 0.28;
      if (s.roof) {
        const o = s.roof;
        (wall(e - i - 0.2, t + c + 0.1, e + i + 0.2, t + c + 0.1, { h: 0.7, t: 0.2, y: u, mk: l }),
          wall(e - i - 0.2, t - c - 0.1, e + i + 0.2, t - c - 0.1, {
            h: 0.7,
            t: 0.2,
            y: u,
            mk: l,
            ops: 's' === o ? [{ o: 0.3, w: 1.3, b: 0, t: 0.7 }] : []
          }),
          wall(e + i + 0.1, t - c - 0.2, e + i + 0.1, t + c + 0.2, {
            h: 0.7,
            t: 0.2,
            y: u,
            mk: l,
            ops: 'e' === o ? [{ o: 0.3, w: 1.3, b: 0, t: 0.7 }] : []
          }),
          wall(e - i - 0.1, t - c - 0.2, e - i - 0.1, t + c + 0.2, {
            h: 0.7,
            t: 0.2,
            y: u,
            mk: l,
            ops: 'w' === o ? [{ o: 0.3, w: 1.3, b: 0, t: 0.7 }] : []
          }));
        const n = Math.ceil(u / 0.3);
        for (let a = 0; a < n; a++) {
          const r = 0.3 * a;
          's' === o
            ? addBox(e - i + 0.95, 0, t - c - 0.39 - 0.34 * (n - 1 - a), 1.3, r + 0.3, 0.34, l)
            : addBox(
                'e' === o ? e + i + 0.39 + 0.34 * (n - 1 - a) : e - i - 0.39 - 0.34 * (n - 1 - a),
                0,
                t - c + 0.95,
                0.34,
                r + 0.3,
                1.3,
                l
              );
        }
      } else
        for (const a of [-1, 1])
          (addBox(e, u, t + a * (c + 0.1), o + 0.4, 0.4, 0.2, l, { collide: !1 }),
            addBox(e + a * (i + 0.1), u, t, 0.2, 0.4, n + 0.4, l, { collide: !1 }));
      for (let o = 0.6 - i; o < i; o += 1.1)
        (addGeo(cylGeo(0.08, 0.08, 0.5, 7), 'bark', e + o, a - 0.15, t + c + 0.35, { rx: Math.PI / 2, collide: !1 }),
          addGeo(cylGeo(0.08, 0.08, 0.5, 7), 'bark', e + o, a - 0.15, t - c - 0.35, { rx: Math.PI / 2, collide: !1 }));
      (o > 6 &&
        (addBox(e - i + 1.2, 0, t + c - 0.8, 1.9, 0.25, 1, 'mattress'),
        addBox(e + i - 1, 0, t - c + 0.9, 1, 0.75, 0.7, 'planks')),
        RNG() < 0.6 &&
          addBox(e + rand(-1, 1), 0, t + rand(-1, 1), 2.4, 0.02, 1.6, RNG() < 0.5 ? 'clothRed' : 'clothBlue', {
            collide: !1,
            cast: !1
          }));
    },
    r = [
      [-16, -14, 10, 8, 3.4, 'n', { roof: 's' }],
      [-16, 1, 8, 10, 3.6, 'e'],
      [-16, 16, 10, 8, 3.3, 's', { roof: 'w' }],
      [0, -18, 12, 7, 3.4, 'n'],
      [1, 18, 12, 8, 3.8, 's', { roof: 's', mk: 'adobe2' }],
      [16, -15, 9, 9, 3.4, 'w', { roof: 'e' }],
      [17, 2, 8, 12, 3.5, 'w', { mk: 'adobe2' }],
      [16, 17, 10, 8, 3.4, 'w'],
      [-32, -26, 10, 9, 3.3, 'e'],
      [-34, -6, 9, 12, 3.4, 'e', { roof: 's' }],
      [-33, 14, 10, 9, 3.2, 'e', { mk: 'adobe2' }],
      [-14, 32, 12, 9, 3.6, 's'],
      [6, 34, 10, 9, 3.3, 's', { roof: 'w' }],
      [30, 30, 10, 10, 3.4, 'w'],
      [34, 8, 9, 12, 3.5, 'w', { roof: 's' }],
      [32, -12, 10, 9, 3.3, 'w'],
      [14, -34, 12, 9, 3.4, 'n'],
      [-12, -34, 10, 8, 3.3, 'n', { mk: 'adobe2' }]
    ];
  for (const e of r) a(...e);
  const s = (e, t, o, n, a = []) => wall(e, t, o, n, { h: 1.7, t: 0.35, mk: 'adobe', ops: a });
  (s(-27, -26, -21, -26, [{ o: 2, w: 1.2, b: 0, t: 1.7 }]),
    s(-21, -26, -21, -19),
    s(21, -20, 26, -20),
    s(26, -20, 26, -6, [{ o: 6, w: 1.4, b: 0, t: 1.7 }]),
    s(-29, -1, -29, 9),
    s(22, 24, 25, 24),
    s(-6, 24, -6, 30),
    s(-8, -26, -4, -26),
    addGeo(cylGeo(1, 1.05, 0.9, 20, 3, 1), 'adobe', 0, 0.45, 0, { collide: !0 }),
    addBox(-1, 0, 0, 0.12, 2.3, 0.12, 'planks'),
    addBox(1, 0, 0, 0.12, 2.3, 0.12, 'planks'),
    addBox(0, 2.2, 0, 2.2, 0.12, 0.12, 'planks', { collide: !1 }));
  const l = stallProp;
  (l(-6.5, -5, 0, 'clothRed'),
    l(6.5, -5, 0, 'clothBlue'),
    l(-6.5, 6, Math.PI, 'clothKhaki'),
    l(7, 6.5, Math.PI, 'clothRed'));
  const i = sandRow;
  (i(-9, -24, 0, 5), i(24, -1, Math.PI / 2, 6), i(-24, 8, Math.PI / 2, 5), i(8, 26, 0, 4), i(-3, -40, 0, 6));
  for (const [e, t] of [
    [10, -7],
    [-11, 9],
    [23, 12],
    [-22, -6],
    [5, 27],
    [-27, 30],
    [33, -28]
  ])
    (crate(e, t, 1, rand(0, 1)), RNG() < 0.6 && crate(e + 0.2, t + 0.1, 0.6, rand(0, 1), 1));
  for (const [e, t, o] of [
    [11, -8.8, 0],
    [12, -8, 1],
    [-12, 10.6, 0],
    [-23, -7.6, 1],
    [24, 13.2, 0],
    [2, -26, 0],
    [-4, 40, 1]
  ])
    barrel(e, t, 0, !!o);
  (car(-5, -28, 0.2), car(26, -2, 1.65), car(-26, -14, 2.8), car(42, 20, 0.6), car(-44, 22, 2.1, e(-44, 22)));
  const c = new THREE.MeshStandardMaterial({ map: SPR.frond, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 });
  c.userData.own = !0;
  const d = new THREE.PlaneGeometry(1, 4.2, 1, 8);
  d.translate(0, 2.1, 0);
  {
    const e = d.attributes.position;
    for (let t = 0; t < e.count; t++) {
      const o = e.getY(t);
      e.setZ(t, -o * o * 0.09);
    }
  }
  (d.rotateX(-Math.PI / 2 + 0.35), d.computeVertexNormals());
  for (const [e, t] of [
    [-9, -9],
    [9, 10],
    [-24, -20],
    [25, 22],
    [-40, 4],
    [38, -20],
    [-3, 30]
  ]) {
    let o = e,
      n = 0,
      a = t;
    const r = rand(-0.25, 0.25),
      s = rand(0, TAU);
    for (let e = 0; e < 8; e++)
      (addGeo(cylGeo(0.17, 0.2, 1.15, 9, 1, 1), 'bark', o, n + 0.57, a, { rz: r * Math.cos(s), rx: r * Math.sin(s) }),
        (n += 1.1),
        (o += -1.1 * Math.sin(r * Math.cos(s)) * 0));
    addCyl(e, t, 0.25, 0, 8, 'wood');
    for (let e = 0; e < 11; e++) {
      const t = new THREE.Mesh(d, c);
      (t.position.set(o, n, a),
        (t.rotation.y = (e / 11) * TAU + rand(-0.2, 0.2)),
        (t.rotation.z = rand(-0.15, 0.15)),
        t.scale.setScalar(rand(0.8, 1.1)),
        (t.castShadow = !0),
        LV.group.add(t));
    }
  }
  for (const [e, t] of [
    [-1.5, -1.5],
    [1.5, -1.5],
    [-1.5, 1.5],
    [1.5, 1.5]
  ])
    addBox(-42 + e, 0, 34 + t, 0.18, 8, 0.18, 'rust');
  (addGeo(cylGeo(2.2, 2.2, 3, 20, 3, 1), 'corr', -42, 9.5, 34, { collide: !0 }),
    addBox(28, 0, -30, 7, 5, 7, 'adobe2'),
    addGeo(new THREE.SphereGeometry(2.6, 24, 12, 0, TAU, 0, Math.PI / 2), 'adobe2', 28, 5, -30),
    addGeo(cylGeo(0.9, 1.1, 16, 16, 3, 4), 'adobe2', 33, 8, -33, { collide: !0 }));
  const u = [];
  for (let t = 0; t < 7; t++) {
    const o = 16 * t - 48,
      n = 2 * Math.sin(t) - 44;
    (addBox(o, e(o, n), n, 0.22, 8, 0.22, 'planks'),
      addBox(o, e(o, n) + 7.4, n, 1.6, 0.12, 0.12, 'planks', { collide: !1 }),
      u.push(V3(o, e(o, n) + 7.45, n)));
  }
  const p = new THREE.LineBasicMaterial({ color: 1118481 });
  for (let e = 0; e < u.length - 1; e++)
    for (const t of [-0.7, 0.7]) {
      const o = u[e],
        n = u[e + 1],
        a = [];
      for (let e = 0; e <= 12; e++) {
        const r = e / 12;
        a.push(V3(lerp(o.x, n.x, r) + t, lerp(o.y, n.y, r) - 0.9 * Math.sin(r * Math.PI), lerp(o.z, n.z, r)));
      }
      LV.group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(a), p));
    }
  for (let e = 0; e < 60; e++)
    addBox(rand(-44, 44), 0, rand(-44, 44), rand(0.2, 0.6), rand(0.1, 0.3), rand(0.2, 0.6), 'adobe', {
      ry: rand(0, 3),
      collide: !1
    });
  const m = new THREE.DirectionalLight(16773336, 6.5);
  (m.position.set(-40, 85, 30), (LV.sun = m));
  const h = new THREE.HemisphereLight(12374764, 11768432, 1.5);
  ((LV.hemi = h),
    LV.group.add(h, m, m.target),
    (LV.skyCfg = {
      top: 2908072,
      hor: 14275264,
      bot: 10848870,
      sun: V3(-0.4, 0.85, 0.3),
      sunCol: 16774108,
      sunSize: 1400,
      glow: 1.4,
      clouds: 0.12,
      cloudCol: 16777215,
      mul: 2.2
    }),
    (LV.fog = new THREE.FogExp2(14207403, 0.0065)),
    (LV.post = {
      exp: 0.85,
      grade: [1.04, 1, 0.92],
      sat: 0.8,
      haze: 1,
      bloomThr: 2.6,
      flash: !1,
      ambience: 'desert',
      reverb: 'desert',
      shadowR: 60,
      envK: 0.25,
      skyK: 2.2
    }),
    (LV.wps = []));
  for (let e = -40; e <= 40; e += 7)
    for (let t = -40; t <= 40; t += 7) {
      const o = e + rand(-1.5, 1.5),
        n = t + rand(-1.5, 1.5);
      groundAt(o, n, 0.3) < 0.6 &&
        !LV.boxes.some(
          e => e.max[1] > 0.6 && o > e.min[0] - 0.5 && o < e.max[0] + 0.5 && n > e.min[2] - 0.5 && n < e.max[2] + 0.5
        ) &&
        LV.wps.push({ x: o, z: n });
    }
  for (const e of r)
    if (e[6] && e[6].roof) {
      const [t, o, n, a, r] = e,
        s = e[6].roof,
        l = r + 0.28,
        i = Math.ceil(l / 0.3),
        c = 0.3 * i,
        d = n / 2,
        u = a / 2;
      if ((LV.wps.push({ x: t, z: o, yh: l }), 's' === s)) {
        const e = t - d + 0.95;
        LV.wps.push(
          { x: e, z: o - u - 0.39 - 0.34 * (i - 1) - 0.9, yh: 0 },
          { x: e, z: o - u - 0.39 - 0.17 * (i - 1), yh: c / 2 },
          { x: e, z: o - u - 0.39, yh: c },
          { x: e, z: o - u + 0.8, yh: l }
        );
      } else {
        const e = o - u + 0.95,
          n = 'e' === s ? 1 : -1;
        LV.wps.push(
          { x: t + n * (d + 0.39 + 0.34 * (i - 1) + 0.9), z: e, yh: 0 },
          { x: t + n * (d + 0.39 + 0.17 * (i - 1)), z: e, yh: c / 2 },
          { x: t + n * (d + 0.39), z: e, yh: c },
          { x: t + n * (d - 0.8), z: e, yh: l }
        );
      }
    }
  for (const e of LV.wps) void 0 === e.yh && (e.yh = 0);
  ((LV.spawns = [
    [0, -8],
    [-24, -30],
    [24, 30],
    [-38, 20],
    [38, -6],
    [-8, 42],
    [10, -42],
    [42, 40],
    [-42, -40],
    [0, 10],
    [-22.6, -2],
    [22, -24]
  ]),
    (LV.preview = [
      { p: [-4, 1.6, -12], q: [-2, 1.7, -8], l: [6, 1.4, 6] },
      { p: [24, 1.6, -7.5], q: [19.5, 1.7, -7], l: [-2, 1.6, -5] },
      { p: [-17, 5.9, -15], q: [-13.5, 5.9, -12], l: [8, 2.2, 6] },
      { p: [-6, 1.6, 10], q: [-3, 1.7, 8], l: [14, 2, -12] }
    ]),
    (LV.clock = [13, 40, 5]));
}
