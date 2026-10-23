/* Construcción del nivel: cajas, paredes, luces y calcas */
const LV = {
  group: null,
  boxes: [],
  cyls: [],
  terrain: null,
  geo: new Map(),
  lights: [],
  tick: [],
  spawns: [],
  wps: [],
  bounds: 60,
  tsurf: 'dirt',
  name: ''
};
function resetLevel() {
  (LV.group &&
    (scene.remove(LV.group),
    LV.group.traverse(e => {
      (e.geometry && e.geometry.dispose(),
        e.material && e.material.userData && e.material.userData.own && e.material.dispose());
    })),
    LV.sky && (scene.remove(LV.sky), LV.sky.geometry.dispose(), LV.sky.material.dispose()),
    scene.environment && scene.environment.dispose(),
    Object.assign(LV, {
      group: new THREE.Group(),
      boxes: [],
      cyls: [],
      terrain: null,
      geo: new Map(),
      lights: [],
      tick: [],
      spawns: [],
      wps: [],
      bounds: 60,
      tsurf: 'dirt',
      hum: [],
      hemi: null,
      indoor: 1
    }),
    scene.add(LV.group));
}
function worldUV(e, t, o, n, a) {
  const r = e.attributes.position,
    s = e.attributes.normal,
    l = e.attributes.uv;
  for (let e = 0; e < r.count; e++) {
    const i = r.getX(e) + t,
      c = r.getY(e) + o,
      d = r.getZ(e) + n,
      u = Math.abs(s.getX(e));
    Math.abs(s.getY(e)) > 0.5
      ? l.setXY(e, i / a, d / a)
      : u > 0.5
        ? l.setXY(e, d / a, c / a)
        : l.setXY(e, i / a, c / a);
  }
}
function pushGeo(e, t, o = !0) {
  const n = e + (o ? '' : '#');
  (LV.geo.has(n) || LV.geo.set(n, []), LV.geo.get(n).push(t));
}
function addCol(e, t, o, n, a, r, s, l) {
  LV.boxes.push({ min: [e, t, o], max: [n, a, r], surf: s || 'concrete', nb: !!l });
}
function addColR(e, t, o, n, a, r, s, l, i) {
  const c = Math.cos(o),
    d = Math.sin(o);
  if (Math.abs(d) < 0.001 || Math.abs(c) < 0.001) {
    const o = Math.abs(d) > 0.5,
      c = (o ? a : n) / 2,
      u = (o ? n : a) / 2;
    return addCol(e - c, r, t - u, e + c, s, t + u, l, i);
  }
  const u = Math.abs(c),
    p = Math.abs(d),
    m = (n * u + a * p) / 2,
    h = (n * p + a * u) / 2;
  LV.boxes.push({
    min: [e - m, r, t - h],
    max: [e + m, s, t + h],
    surf: l || 'concrete',
    nb: !!i,
    o: { cx: e, cz: t, c, s: d, hx: n / 2, hz: a / 2 }
  });
}
function inBoxXZ(e, t, o, n) {
  if (t < e.min[0] - n || t > e.max[0] + n || o < e.min[2] - n || o > e.max[2] + n) return !1;
  const a = e.o;
  if (!a) return !0;
  const r = t - a.cx,
    s = o - a.cz,
    l = r * a.c - s * a.s,
    i = r * a.s + s * a.c;
  return Math.abs(l) < a.hx + n && Math.abs(i) < a.hz + n;
}
function addCyl(e, t, o, n, a, r) {
  LV.cyls.push({ x: e, z: t, r: o, y0: n, y1: a, surf: r || 'wood' });
}
const _q = new THREE.Quaternion(),
  _e = new THREE.Euler(),
  _m4 = new THREE.Matrix4(),
  _s1 = V3(1, 1, 1);
function addBox(e, t, o, n, a, r, s, l = {}) {
  const i = M(s),
    c = new THREE.BoxGeometry(n, a, r);
  if (
    (worldUV(c, e, t + a / 2, o, i.userData.tile),
    _e.set(l.rx || 0, l.ry || 0, l.rz || 0),
    _q.setFromEuler(_e),
    _m4.compose(V3(e, t + a / 2, o), _q, _s1),
    c.applyMatrix4(_m4),
    pushGeo(s, c, !1 !== l.cast),
    !1 !== l.collide)
  )
    if (!l.ry || l.rx || l.rz) {
      c.computeBoundingBox();
      const e = c.boundingBox;
      addCol(e.min.x, e.min.y, e.min.z, e.max.x, e.max.y, e.max.z, l.surf || i.userData.surf, l.nb);
    } else addColR(e, o, l.ry, n, r, t, t + a, l.surf || i.userData.surf, l.nb);
  return c;
}
function addGeo(e, t, o, n, a, r = {}) {
  if (
    (_e.set(r.rx || 0, r.ry || 0, r.rz || 0),
    _q.setFromEuler(_e),
    _m4.compose(V3(o, n, a), _q, r.s ? V3(r.s[0], r.s[1], r.s[2]) : _s1),
    e.applyMatrix4(_m4),
    pushGeo(t, e, !1 !== r.cast),
    r.collide)
  ) {
    e.computeBoundingBox();
    const o = e.boundingBox;
    addCol(o.min.x, o.min.y, o.min.z, o.max.x, o.max.y, o.max.z, r.surf || M(t).userData.surf, r.nb);
  }
}
function cylGeo(e, t, o, n = 12, a = 1, r = 1) {
  const s = new THREE.CylinderGeometry(e, t, o, n),
    l = s.attributes.uv;
  for (let e = 0; e < l.count; e++) l.setXY(e, l.getX(e) * a, l.getY(e) * r);
  return s;
}
function mergeGeos(e) {
  for (const t of e) 'function' == typeof cleanNormals && cleanNormals(t);
  let t = 0,
    o = 0;
  for (const n of e) ((t += n.attributes.position.count), (o += n.index ? n.index.count : n.attributes.position.count));
  const n = new Float32Array(3 * t),
    a = new Float32Array(3 * t),
    r = new Float32Array(2 * t),
    s = new Uint32Array(o);
  let l = null;
  e.some(e => e.attributes.color) && (l = new Float32Array(3 * t).fill(1));
  let i = 0,
    c = 0;
  for (const t of e) {
    const e = t.attributes.position.count;
    if (
      (n.set(t.attributes.position.array, 3 * i),
      a.set(t.attributes.normal.array, 3 * i),
      r.set(t.attributes.uv.array, 2 * i),
      l && t.attributes.color && l.set(t.attributes.color.array, 3 * i),
      t.index)
    ) {
      const e = t.index.array;
      for (let t = 0; t < e.length; t++) s[c++] = e[t] + i;
    } else for (let t = 0; t < e; t++) s[c++] = i + t;
    ((i += e), t.dispose());
  }
  const d = new THREE.BufferGeometry();
  return (
    d.setAttribute('position', new THREE.BufferAttribute(n, 3)),
    d.setAttribute('normal', new THREE.BufferAttribute(a, 3)),
    d.setAttribute('uv', new THREE.BufferAttribute(r, 2)),
    l && d.setAttribute('color', new THREE.BufferAttribute(l, 3)),
    d.setIndex(new THREE.BufferAttribute(s, 1)),
    d.computeBoundingSphere(),
    d
  );
}
function finalizeLevel() {
  for (const [e, t] of LV.geo) {
    const o = !e.endsWith('#'),
      n = o ? e : e.slice(0, -1),
      a = new THREE.Mesh(mergeGeos(t), M(n));
    ((a.castShadow = o), (a.receiveShadow = !0), (a.matrixAutoUpdate = !1), LV.group.add(a));
  }
  (LV.geo.clear(),
    LV.group.traverse(e => {
      e.isLight && e.layers.enableAll();
    }));
}
function wall(
  e,
  t,
  o,
  n,
  { h: a = 3.4, t: r = 0.2, y: s = 0, mk: l = 'paint', ops: i = [], frame: c = !1, boards: d = 0 } = {}
) {
  const u = Math.abs(n - t) < 1e-6,
    p = u ? o - e : n - t,
    m = (o, n, a, i) => {
      n - o < 0.01 ||
        i - a < 0.01 ||
        (u
          ? addBox(e + (o + n) / 2, s + a, t, n - o, i - a, r, l)
          : addBox(e, s + a, t + (o + n) / 2, r, i - a, n - o, l));
    };
  i = i.slice().sort((e, t) => e.o - t.o);
  let h = 0;
  for (const e of i)
    (m(h, e.o, 0, a), m(e.o, e.o + e.w, 0, e.b || 0), e.t < a && m(e.o, e.o + e.w, e.t, a), (h = e.o + e.w));
  if ((m(h, p, 0, a), c))
    for (const o of i) {
      if (!(o.b > 0)) continue;
      const n = o.o,
        a = o.o + o.w,
        l = (n + a) / 2,
        i = o.w,
        c = s + o.b,
        p = s + o.t,
        m = (o, n, a, r, s, l, i) => (u ? addBox(e + o, n, t, a, r, s, l, i) : addBox(e, n, t + o, s, r, a, l, i));
      if (
        (m(l, c - 0.07, i + 0.24, 0.07, r + 0.14, 'concrete', { collide: !1 }),
        m(l, p, i + 0.12, 0.07, r + 0.04, 'rust', { collide: !1, cast: !1 }),
        m(n + 0.03, c, 0.06, p - c, r + 0.04, 'rust', { collide: !1, cast: !1 }),
        m(a - 0.03, c, 0.06, p - c, r + 0.04, 'rust', { collide: !1, cast: !1 }),
        m(l, c + 0.5 * (p - c) - 0.025, i, 0.05, 0.05, 'rust', { collide: !1, cast: !1 }),
        d && RNG() < d)
      ) {
        const o = 2 + Math.floor(2 * RNG()),
          n = (RNG() < 0.5 ? 1 : -1) * (r / 2 + 0.03);
        for (let a = 0; a < o; a++) {
          const r = c + ((a + 0.5) / o) * (p - c) - 0.09,
            s = 0.35 * (RNG() - 0.5),
            d = i + 0.3;
          u
            ? addBox(e + l, r, t + n, d, 0.18, 0.03, 'planks', { collide: !1, rz: s })
            : addBox(e + n, r, t + l, 0.03, 0.18, d, 'planks', { collide: !1, rx: s });
        }
      }
    }
}
const DOOR = (e, t = 1.2, o = 2.2) => ({ o: e, w: t, b: 0, t: o }),
  WIN = (e, t = 1.6, o = 1, n = 2.4) => ({ o: e, w: t, b: o, t: n });
function pLight(e, t, o, n, a, r, s = 0) {
  const l = new THREE.PointLight(n, a, r, 2);
  return (
    l.position.set(e, t, o),
    (l.userData = { base: a, flick: s, ph: 100 * Math.random() }),
    LV.group.add(l),
    LV.lights.push(l),
    l
  );
}
function emissiveMat(e, t) {
  const o = new THREE.MeshStandardMaterial({ color: 1118481, emissive: e, emissiveIntensity: t, roughness: 0.6 });
  return (o.emissive.convertSRGBToLinear(), (o.userData.own = !0), o);
}
function decal(e, t, o, n, a, r, s, l = {}) {
  const i = new THREE.MeshStandardMaterial({
    map: e,
    transparent: !0,
    depthWrite: !1,
    roughness: l.ro || 0.9,
    polygonOffset: !0,
    polygonOffsetFactor: -2,
    emissive: l.em ? new THREE.Color(l.em) : new THREE.Color(0),
    emissiveMap: l.em ? e : null,
    emissiveIntensity: l.ei || 0
  });
  i.userData.own = !0;
  const c = new THREE.Mesh(new THREE.PlaneGeometry(a, r), i);
  return (c.position.set(t, o, n), c.rotation.set(l.rx || 0, s, 0), (c.receiveShadow = !0), LV.group.add(c), c);
}
