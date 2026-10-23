/* Atrezo: mesas, cajas, barriles, coches, sacos, puestos, autobús */
const rotP = (e, t, o, n, a) => [e + n * Math.cos(o) + a * Math.sin(o), t - n * Math.sin(o) + a * Math.cos(o)];
function part(e, t, o, n, a, r, s, l, i, c, d = {}) {
  const [u, p] = rotP(e, t, o, n, r);
  return addBox(u, a, p, s, l, i, c, Object.assign({ ry: o, collide: !1 }, d));
}
function colR(e, t, o, n, a, r, s, l) {
  addColR(e, t, o, n, a, r, s, l);
}
function mesh(e, t, o, n, a, r = {}) {
  const s = new THREE.Mesh(e, t);
  return (
    s.position.set(o, n, a),
    s.rotation.set(r.rx || 0, r.ry || 0, r.rz || 0),
    r.s && s.scale.set(...r.s),
    (s.castShadow = !1 !== r.cast),
    (s.receiveShadow = !0),
    LV.group.add(s),
    s
  );
}
function desk(e, t, o = 0, n = !1, a = 0) {
  if (n)
    return (
      part(e, t, o, 0, a, 0, 0.7, 0.52, 0.04, 'planks'),
      part(e, t, o, -0.3, a + 0.1, 0.32, 0.03, 0.03, 0.62, 'rust'),
      part(e, t, o, 0.3, a + 0.1, 0.32, 0.03, 0.03, 0.62, 'rust'),
      part(e, t, o, -0.3, a + 0.42, 0.32, 0.03, 0.03, 0.62, 'rust'),
      part(e, t, o, 0.3, a + 0.42, 0.32, 0.03, 0.03, 0.62, 'rust'),
      void colR(e, t, o, 0.72, 0.08, a, a + 0.52, 'wood')
    );
  (part(e, t, o, 0, a + 0.72, 0, 0.7, 0.035, 0.5, 'planks'), part(e, t, o, 0, a + 0.55, 0.02, 0.64, 0.02, 0.4, 'rust'));
  for (const [n, r] of [
    [-0.32, -0.22],
    [0.32, -0.22],
    [-0.32, 0.22],
    [0.32, 0.22]
  ])
    part(e, t, o, n, a, r, 0.03, 0.72, 0.03, 'rust');
  (part(e, t, o, 0, a + 0.44, -0.45, 0.4, 0.035, 0.38, 'planks'),
    part(e, t, o, 0, a + 0.5, -0.64, 0.4, 0.34, 0.025, 'planks'));
  for (const [n, r] of [
    [-0.17, -0.3],
    [0.17, -0.3],
    [-0.17, -0.6],
    [0.17, -0.6]
  ])
    part(e, t, o, n, a, r, 0.025, 0.44, 0.025, 'rust');
  colR(e, t, o, 0.72, 0.52, a, a + 0.76, 'wood');
}
function propMats() {
  if (MATS.carpaint_burnt) return;
  const e = (e, t, o, n) => {
      ((t.userData = { tile: o, surf: n, own: !1 }), (MATS[e] = t));
    },
    t = genPBR('rust'),
    o = genPBR('polymer'),
    n = genPBR('cloth'),
    a = genPBR('gunmetal'),
    r = (e, t) => stdMat(e, t);
  {
    const o = r(t, { color: 14733504 });
    ((o.metalness = 0.25), e('carpaint_burnt', o, 1.2, 'metal'));
  }
  const s = genPBR('concrete');
  [7306613, 11052181, 4872814, 9323572].forEach((t, o) => {
    const n = new THREE.MeshStandardMaterial({
      color: t,
      roughness: 0.42,
      metalness: 0.35,
      normalMap: s.normalMap,
      roughnessMap: s.rm,
      envMapIntensity: 1.3
    });
    (n.normalScale.set(0.25, 0.25), n.color.convertSRGBToLinear(), e('carpaint' + o, n, 2.5, 'metal'));
  });
  const l = r(o, { color: 2763306 });
  ((l.metalness = 0), e('rubber', l, 0.4, 'dirt'));
  const i = new THREE.MeshStandardMaterial({ color: 724496, roughness: 0.06, metalness: 0.9, envMapIntensity: 1.6 });
  e('glassdark', i, 1, 'metal');
  const c = r(a, { color: 12369084 });
  ((c.metalness = 1), e('chrome', c, 0.5, 'metal'));
  const d = r(n, { color: 10521700 });
  (d.normalScale.set(2.5, 2.5), e('sandbag', d, 0.6, 'sand'));
}
function bev(e, t, o, n = 0.02) {
  return ext(
    [
      [-e / 2, -t / 2],
      [e / 2, -t / 2],
      [e / 2, t / 2],
      [-e / 2, t / 2]
    ],
    o,
    Math.min(n, 0.3 * e, 0.3 * t, 0.3 * o),
    null,
    2
  );
}
function placeGeo(e, t, o, n, a, r, s = 0, l = 0) {
  addGeo(e, t, o, n, a, { ry: r, rx: s, rz: l });
}
function crate(e, t, o = 1, n = 0, a = 0) {
  const r = (o, r, s, l, i, c, d = 0) => {
      const u = bev(l, i, c, 0.008);
      d && u.rotateZ(d);
      const [p, m] = rotP(e, t, n, o, s);
      placeGeo(u, 'planks', p, a + r, m, n);
    },
    s = 0.035 * o,
    l = o / 2;
  for (const [e, t] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
  ])
    for (let n = 0; n < 4; n++) {
      const a = ((n + 0.5) * o) / 4;
      t
        ? r(0, a, t * (l - 0.6 * s), o - 2 * s, o / 4 - 0.012, 0.8 * s)
        : r(e * (l - 0.6 * s), a, 0, 0.8 * s, o / 4 - 0.012, o - 2 * s);
    }
  (r(0, o - s / 2, 0, o, s, o), r(0, s / 2, 0, o, s, o));
  for (const [e, t] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ])
    r(e * (l - s / 2), l, t * (l - s / 2), 1.2 * s, o, 1.2 * s);
  for (const r of [1, -1]) {
    const i = bev(1.25 * o, 1.6 * s, s, 0.006);
    i.rotateZ(Math.atan2(o - 2 * s, o - 2 * s) * (r > 0 ? 1 : -1));
    const [c, d] = rotP(e, t, n, 0, r * (l + 0.15 * s));
    placeGeo(i, 'planks', c, a + l, d, n);
  }
  colR(e, t, n, o, o, a, a + o, 'wood');
}
function barrel(e, t, o = 0, n = !1) {
  const a = 0.29,
    r = 0.88,
    s = [
      [0, 0],
      [0.2784, 0],
      [a, 0.02],
      [a, 0.27],
      [0.30015, 0.29],
      [a, 0.31],
      [a, 0.57],
      [0.30015, 0.59],
      [a, 0.61],
      [a, 0.86],
      [0.2784, r],
      [0.261, r],
      [0.261, 0.868],
      [0, 0.868]
    ],
    l = new THREE.LatheGeometry(
      s.map(e => V2(e[0], e[1])),
      28
    );
  if ((scaleUV(l, 2), n)) {
    const n = rand(0, 3);
    (l.translate(0, -r / 2, 0),
      addGeo(l, 'rust', e, o + a, t, { rz: Math.PI / 2, ry: n }),
      addColR(e, t, n, r, 2 * a, o, o + 2 * a, 'metal'));
  } else (addGeo(l, 'rust', e, o, t), addCyl(e, t, 0.3, o, o + r, 'metal'));
}
function carShape() {
  const e = new THREE.Shape();
  return (
    e.moveTo(-2.25, 0.32),
    e.absarc(-1.32, 0.32, 0.36, Math.PI, 0, !0),
    e.absarc(1.32, 0.32, 0.36, Math.PI, 0, !0),
    e.lineTo(2.25, 0.32),
    e.lineTo(2.3, 0.62),
    e.quadraticCurveTo(2.28, 0.78, 2.1, 0.82),
    e.lineTo(1, 0.9),
    e.lineTo(0.35, 1.36),
    e.quadraticCurveTo(0.2, 1.42, 0, 1.43),
    e.lineTo(-0.95, 1.42),
    e.quadraticCurveTo(-1.15, 1.4, -1.25, 1.33),
    e.lineTo(-1.75, 0.95),
    e.lineTo(-2.2, 0.9),
    e.quadraticCurveTo(-2.32, 0.86, -2.3, 0.7),
    e
  );
}
const CAR_TOP = [
  [-2.36, 0.68],
  [-2.2, 0.96],
  [-1.75, 1.01],
  [-1.25, 1.39],
  [-0.95, 1.48],
  [0, 1.49],
  [0.2, 1.48],
  [0.35, 1.42],
  [1, 0.96],
  [2.1, 0.88],
  [2.28, 0.84],
  [2.36, 0.66]
];
function carTopAt(e) {
  for (let t = 1; t < CAR_TOP.length; t++) {
    const [o, n] = CAR_TOP[t - 1],
      [a, r] = CAR_TOP[t];
    if (e <= a) return n + (r - n) * clamp((e - o) / (a - o), 0, 1);
  }
  return CAR_TOP[CAR_TOP.length - 1][1];
}
function carCols(e, t, o, n) {
  const a = 4.72;
  for (let r = 0; r < 16; r++) {
    const s = -a / 2 + (r * a) / 16,
      l = s + a / 16,
      i = ((carTopAt(s) + carTopAt(l)) / 2) * 0.5 + 0.5 * carTopAt((s + l) / 2),
      [c, d] = rotP(e, t, o, 0, (s + l) / 2);
    addColR(c, d, o, 1.78, a / 16, n + 0.24, n + i, 'metal');
  }
}
function car(e, t, o, n = 0, a = !0) {
  propMats();
  const r = a ? 'carpaint_burnt' : 'carpaint' + ((0 | Math.abs(7 * e + 3 * t)) % 4),
    s = new THREE.ExtrudeGeometry(carShape(), {
      depth: 1.62,
      bevelEnabled: !0,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 4,
      curveSegments: 14
    });
  (s.translate(0, 0, -0.81), s.rotateY(-Math.PI / 2), scaleUV(s, 0.8));
  const [l, i] = rotP(e, t, o, 0, 0);
  placeGeo(s, r, l, n, i, o);
  const c = new THREE.Shape();
  (c.moveTo(0.92, 0.92),
    c.lineTo(0.33, 1.32),
    c.quadraticCurveTo(0.2, 1.37, 0, 1.38),
    c.lineTo(-0.92, 1.37),
    c.quadraticCurveTo(-1.1, 1.35, -1.2, 1.29),
    c.lineTo(-1.66, 0.95));
  const d = new THREE.ExtrudeGeometry(c, { depth: 1.8, bevelEnabled: !1 });
  (d.translate(0, 0, -0.9), d.rotateY(-Math.PI / 2), scaleUV(d, 1), a || placeGeo(d, 'glassdark', l, n + 0.005, i, o));
  const u = bev(0.08, 0.42, 1.74, 0.01),
    [p, m] = rotP(e, t, o, 0, -0.22);
  placeGeo(u, r, p, n + 1.13, m, o);
  for (const r of [-1, 1]) {
    const s = bev(1.7, 0.16, 0.12, 0.03),
      [l, i] = rotP(e, t, o, 0, 2.32 * r);
    placeGeo(s, a ? 'rust' : 'rubber', l, n + 0.42, i, o);
    for (const s of [-1, 1]) {
      const l = bev(0.32, 0.12, 0.04, 0.01),
        [i, c] = rotP(e, t, o, 0.6 * s, 2.3 * r);
      placeGeo(l, a ? 'rust' : 'glassdark', i, n + 0.7, c, o);
    }
  }
  const h = [
    [0.18, -0.11],
    [0.3, -0.12],
    [0.35, -0.09],
    [0.36, 0],
    [0.35, 0.09],
    [0.3, 0.12],
    [0.18, 0.11]
  ];
  for (const [r, s] of [
    [-0.8, 1.32],
    [0.8, 1.32],
    [-0.8, -1.32],
    [0.8, -1.32]
  ]) {
    const l = new THREE.LatheGeometry(
      h.map(e => V2(e[0], e[1])),
      26
    );
    (l.rotateZ(Math.PI / 2), scaleUV(l, 2));
    const [i, c] = rotP(e, t, o, r, s);
    (!a || r > 0) && placeGeo(l, 'rubber', i, n + 0.36, c, o);
    const d = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 20);
    (d.rotateZ(Math.PI / 2), scaleUV(d, 1), placeGeo(d, a ? 'rust' : 'chrome', i, n + 0.36, c, o));
  }
  (placeGeo(bev(1.5, 0.18, 4, 0.02), 'rust', l, n + 0.22, i, o), carCols(e, t, o, n));
}
const SANDBAG = (() => {
  let e = null;
  return () => {
    if (e) return e;
    e = new THREE.SphereGeometry(1, 16, 10);
    const t = e.attributes.position;
    for (let e = 0; e < t.count; e++) {
      let o = t.getX(e),
        n = t.getY(e),
        a = t.getZ(e);
      ((n = Math.sign(n) * Math.pow(Math.abs(n), 0.55)),
        (o = Math.sign(o) * Math.pow(Math.abs(o), 0.7)),
        t.setXYZ(e, 0.3 * o, 0.11 * n, 0.19 * a));
    }
    return (e.computeVertexNormals(), scaleUV(e, 3), e);
  };
})();
function sandRow(e, t, o, n) {
  propMats();
  for (let a = 0; a < 3; a++)
    for (let r = 0; r < n; r++) {
      const [s, l] = rotP(e, t, o, 0.6 * (r - n / 2 + 0.5) + 0.3 * (1 & a), rand(-0.02, 0.02));
      addGeo(SANDBAG().clone(), 'sandbag', s, 0.21 * a + 0.11, l, { ry: o + rand(-0.12, 0.12), rz: rand(-0.05, 0.05) });
    }
  colR(e, t, o, 0.6 * n + 0.3, 0.42, 0, 0.68, 'dirt');
}
function stallProp(e, t, o, n) {
  for (const [n, a] of [
    [-1.2, -0.8],
    [1.2, -0.8],
    [-1.2, 0.8],
    [1.2, 0.8]
  ]) {
    const r = new THREE.CylinderGeometry(0.045, 0.05, 2.3, 8);
    (r.translate(0, 1.15, 0), scaleUV(r, 1));
    const [s, l] = rotP(e, t, o, n, a);
    (addGeo(r, 'planks', s, 0, l, { ry: o }), addCyl(s, l, 0.06, 0, 2.3, 'wood'));
  }
  const a = new THREE.PlaneGeometry(2.7, 1.95, 14, 10),
    r = a.attributes.position;
  for (let e = 0; e < r.count; e++) {
    const t = r.getX(e),
      o = r.getY(e);
    r.setZ(e, -(1 - Math.pow(t / 1.35, 2)) * (1 - Math.pow(o / 0.975, 2)) * 0.16 + 0.008 * Math.sin(7 * t));
  }
  (a.rotateX(-Math.PI / 2), a.computeVertexNormals(), scaleUV(a, 1));
  const [s, l] = rotP(e, t, o, 0, 0);
  (addGeo(a, n, s, 2.28, l, { ry: o, cast: !0 }), part(e, t, o, 0, 0.8, -0.4, 2.4, 0.05, 0.8, 'planks'));
  for (const n of [-1, 1]) part(e, t, o, 1.05 * n, 0, -0.4, 0.06, 0.8, 0.06, 'planks');
  colR(e, t, o, 2.4, 0.9, 0, 0.86, 'wood');
  const [i, c] = rotP(e, t, o, -0.6, -0.4);
  crate(i, c, 0.45, o, 0.85);
}
function cleanNormals(e) {
  const t = e.attributes.normal;
  if (!t) return e;
  const o = t.array;
  for (let e = 0; e < o.length; e += 3)
    (isFinite(o[e]) && isFinite(o[e + 1]) && isFinite(o[e + 2]) && (0 !== o[e] || 0 !== o[e + 1] || 0 !== o[e + 2])) ||
      ((o[e] = 0), (o[e + 1] = 1), (o[e + 2] = 0));
  return e;
}
function bus(e, t, o) {
  propMats();
  const n = new THREE.Shape();
  (n.moveTo(-5.3, 0.45),
    n.absarc(-3.6, 0.45, 0.55, Math.PI, 0, !0),
    n.absarc(3.2, 0.45, 0.55, Math.PI, 0, !0),
    n.lineTo(5.3, 0.45),
    n.lineTo(5.35, 1.2),
    n.lineTo(5.15, 2.9),
    n.quadraticCurveTo(5.05, 3.05, 4.8, 3.05),
    n.lineTo(-5.1, 3.05),
    n.quadraticCurveTo(-5.3, 3, -5.32, 2.8));
  const a = new THREE.ExtrudeGeometry(n, {
    depth: 2.36,
    bevelEnabled: !0,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 3,
    curveSegments: 12
  });
  (a.translate(0, 0, -1.18), a.rotateY(-Math.PI / 2), scaleUV(a, 0.8), addGeo(a, 'carpaint_burnt', e, 0, t, { ry: o }));
  for (let n = 0; n < 9; n++) {
    const a = bev(1, 0.75, 2.5, 0.02),
      [r, s] = rotP(e, t, o, 0, 1.05 * n - 4.4);
    addGeo(a, 'glassdark', r, 1.95, s, { ry: o });
  }
  const r = [
    [0.25, -0.14],
    [0.42, -0.15],
    [0.5, -0.11],
    [0.52, 0],
    [0.5, 0.11],
    [0.42, 0.15],
    [0.25, 0.14]
  ];
  for (const [n, a] of [
    [-1.05, 3.6],
    [1.05, 3.6],
    [-1.05, -3.2],
    [1.05, -3.2]
  ]) {
    const s = new THREE.LatheGeometry(
      r.map(e => V2(e[0], e[1])),
      24
    );
    (s.rotateZ(Math.PI / 2), scaleUV(s, 2));
    const [l, i] = rotP(e, t, o, n, a);
    addGeo(s, 'rubber', l, 0.5, i, { ry: o });
  }
  colR(e, t, o, 2.5, 10.7, 0, 3.05, 'metal');
}
