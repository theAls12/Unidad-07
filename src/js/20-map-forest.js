/* Mapa: bosque con cabañas */
function buildForest() {
  ((LV.name = 'forest'), (LV.bounds = 88), (LV.tsurf = 'dirt'));
  const e = [
      { x: 0, z: 0, r: 9 },
      { x: -30, z: 22, r: 6 },
      { x: 28, z: -18, r: 6 },
      { x: -24, z: -34, r: 6 },
      { x: 34, z: 30, r: 6 },
      { x: 14, z: 42, r: 4 },
      { x: 6, z: 10, r: 3 }
    ],
    t = (e, t) =>
      15 * (nz.v(0.018 * e + 40, 0.018 * t + 40) - 0.5) +
      3 * (nz.v(0.06 * e + 9, 0.06 * t + 3) - 0.5) +
      0.4 * (nz.v(0.2 * e, 0.2 * t) - 0.5);
  for (const o of e) o.h = t(o.x, o.z);
  const o = (o, n) => {
    let a = t(o, n);
    for (const t of e) {
      const e = Math.hypot(o - t.x, n - t.z);
      if (e < t.r + 7) {
        const o = smooth(t.r + 7, t.r, e);
        a += (t.h - a) * o;
      }
    }
    const r = Math.max(Math.abs(o), Math.abs(n));
    return ((a += 14 * smooth(72, 96, r)), a);
  };
  LV.terrain = o;
  const n = new THREE.PlaneGeometry(220, 220, 180, 180);
  n.rotateX(-Math.PI / 2);
  const a = n.attributes.position,
    r = n.attributes.uv,
    s = new Float32Array(3 * a.count);
  for (let e = 0; e < a.count; e++) {
    const t = a.getX(e),
      n = a.getZ(e);
    (a.setY(e, o(t, n)), r.setXY(e, t / 5, n / 5));
    const l = 0.85 + 0.3 * nz.v(0.08 * t, 0.08 * n);
    ((s[3 * e] = l), (s[3 * e + 1] = l), (s[3 * e + 2] = l));
  }
  (n.setAttribute('color', new THREE.BufferAttribute(s, 3)), n.computeVertexNormals());
  const l = M('ground').clone();
  ((l.vertexColors = !0),
    (l.userData.own = !0),
    RA.grass_d && ((l.map = RA.grass_d), l.color.setRGB(0.5, 0.47, 0.36)),
    (l.userData.ntMac = 0.3),
    RA.grass_d && ((l.userData.ntMix = genPBR('ground').map), l.normalScale.set(0.45, 0.45)),
    noTile(l, 'free'),
    mesh(n, l, 0, 0, 0, { cast: !1 }));
  const i = (t, o, n, a, r, s) => {
    const l = e.find(e => e.x === t && e.z === o),
      i = l.h + 0.45,
      c = (e, n) => rotP(t, o, r, e, n),
      [d, u] = [t, o];
    addBox(t, l.h - 0.6, o, r ? a + 0.4 : n + 0.4, 1.05, r ? n + 0.4 : a + 0.4, 'planks', { surf: 'wood' });
    const p = n / 2,
      m = a / 2,
      h = (e, t, o, n, a) => {
        const [r, s] = c(e, t),
          [l, d] = c(o, n);
        wall(Math.min(r, l), Math.min(s, d), Math.max(r, l), Math.max(s, d), {
          h: 2.6,
          t: 0.26,
          y: i,
          mk: 'logs',
          ops: a
        });
      };
    r
      ? (h(-p, m, p, m, []),
        h(-p, -m, p, -m, [WIN(n / 2 - 0.5, 1, 1, 1.9)]),
        h(-p, -m, -p, m, [DOOR(a / 2 - 0.55, 1.1, 2.1)]),
        h(p, -m, p, m, [WIN(a / 2 - 0.5, 1, 1, 1.9)]))
      : (h(-p, m, p, m, [DOOR(n / 2 - 0.55, 1.1, 2.1), WIN(0.8, 1, 1, 1.9)]),
        h(-p, -m, p, -m, [WIN(n / 2 - 0.5, 1, 1, 1.9)]),
        h(-p, -m, -p, m, [WIN(a / 2 - 0.5, 1, 1, 1.9)]),
        h(p, -m, p, m, []));
    const f = n,
      g = a,
      v = i + 2.6,
      T = 0.6,
      b = (f / 2 + 0.55) / Math.cos(T),
      y = v + (Math.tan(T) * f) / 4;
    (r
      ? (addBox(t, y - 0.06, o - f / 4 - 0.1, g + 0.9, 0.12, b, 'corr', { rx: -T, collide: !1 }),
        addBox(t, y - 0.06, o + f / 4 + 0.1, g + 0.9, 0.12, b, 'corr', { rx: T, collide: !1 }))
      : (addBox(t - f / 4 - 0.1, y - 0.06, o, b, 0.12, g + 0.9, 'corr', { rz: T, collide: !1 }),
        addBox(t + f / 4 + 0.1, y - 0.06, o, b, 0.12, g + 0.9, 'corr', { rz: -T, collide: !1 })),
      addBox(t, v, o, r ? g : f, 0.1, r ? f : g, 'planks', { collide: !1 }));
    for (const e of [-1, 1])
      for (let n = 0; n < 4; n++) {
        const a = f * (1 - n / 4) * 0.92,
          s = (Math.tan(T) * f) / 8;
        r
          ? addBox(t + e * (g / 2), v + n * s, o, 0.24, s, a, 'logs', { collide: !1 })
          : addBox(t, v + n * s, o + e * (g / 2), a, s, 0.24, 'logs', { collide: !1 });
      }
    const [x, M] = c(0, m + 1.3);
    if (r) {
      const [e, t] = c(-p - 1.3, 0);
      (addBox(e, l.h - 0.6, t, a, 1.05, 2.2, 'planks'), addBox(e, l.h - 0.45, t + 1.4, 1.6, 0.6, 0.6, 'planks'));
    } else (addBox(x, l.h - 0.6, M, n, 1.05, 2.2, 'planks'), addBox(x, l.h - 0.45, M + 1.4, 1.6, 0.6, 0.6, 'planks'));
    const [w, E] = c(1.2 - p, 0.7 - m);
    addBox(w, i, E, 1.9, 0.5, 0.9, 'mattress', { ry: r ? Math.PI / 2 : 0 });
    const [S, G] = c(0.6, 0);
    (addBox(S, i + 0.75, G, 1.1, 0.05, 0.8, 'planks', { collide: !1 }), colR(S, G, 0, 1.1, 0.8, i, i + 0.8, 'wood'));
    const [P, A] = c(p - 0.6, 0.6 - m);
    if ((addBox(P, i, A, 0.6, 0.8, 0.6, 'rust'), addGeo(cylGeo(0.07, 0.07, 2.2, 8), 'rust', P, i + 1.9, A), s)) {
      const [e, t] = c(0, 0),
        o = pLight(e, i + 1.9, t, 16751176, 26, 10, 0.6);
      (mesh(new THREE.SphereGeometry(0.07, 8, 6), emissiveMat(16754784, 40), e, i + 1.85, t, { cast: !1 }),
        LV.tick.push(e => {
          o.intensity = 26 * (0.85 + 0.15 * Math.sin(9 * e + o.userData.ph) + 0.08 * (Math.random() - 0.5));
        }));
    }
  };
  (i(0, 0, 9, 7, 0, !0),
    i(-30, 22, 6.5, 5, Math.PI / 2, !1),
    i(28, -18, 6.5, 5, 0, !0),
    i(-24, -34, 6.5, 5, 0, !1),
    i(34, 30, 6.5, 5, Math.PI / 2, !1));
  {
    const t = e[5].h;
    for (const [e, o] of [
      [-1.4, -1.4],
      [1.4, -1.4],
      [-1.4, 1.4],
      [1.4, 1.4]
    ])
      addBox(14 + e, t, 42 + o, 0.2, 4.4, 0.2, 'planks');
    (addBox(14, t + 4, 42, 3.4, 0.14, 3.4, 'planks'),
      addBox(12.35, t + 4.14, 42, 0.1, 1, 3.4, 'planks'),
      addBox(15.65, t + 4.14, 42, 0.1, 1, 3.4, 'planks'),
      addBox(14, t + 4.14, 43.65, 3.4, 1, 0.1, 'planks'),
      addBox(13.1, t + 4.14, 40.35, 1.2, 1, 0.1, 'planks'));
    for (let e = 0; e < 12; e++) addBox(14.75, t + 0.34 * e, 40.15 - 0.32 * (11 - e), 1, 0.34, 0.32, 'planks');
  }
  {
    const t = e[6];
    for (let e = 0; e < 8; e++) {
      const o = (e / 8) * TAU;
      addGeo(new THREE.DodecahedronGeometry(0.18, 1), 'rock', 6 + 0.6 * Math.cos(o), t.h + 0.1, 10 + 0.6 * Math.sin(o));
    }
    for (let e = 0; e < 3; e++)
      addGeo(cylGeo(0.08, 0.08, 1.1, 8), 'bark', 6, t.h + 0.15, 10, { rz: Math.PI / 2, ry: e });
    const o = pLight(6, t.h + 0.8, 10, 16742954, 60, 16, 0.8);
    ((LV.fire = V3(6, t.h + 0.3, 10)),
      LV.tick.push(e => {
        o.intensity = 60 * (0.75 + 0.25 * Math.sin(13 * e) * Math.sin(7.3 * e) + 0.15 * (Math.random() - 0.5));
      }),
      addBox(4, t.h, 12.2, 2, 0.42, 0.4, 'logs'),
      addBox(8.4, t.h, 8.4, 0.4, 0.42, 2, 'logs'));
  }
  car(-8, -12, 0.4, o(-8, -12), !1);
  const c = () => {
    const e = new THREE.IcosahedronGeometry(1, 2),
      t = e.attributes.position;
    for (let e = 0; e < t.count; e++) {
      const o = V3(t.getX(e), t.getY(e), t.getZ(e));
      (o.multiplyScalar(0.75 + 0.5 * nz.v(2 * o.x + 5, 2 * o.z + 3 * o.y)), t.setXYZ(e, o.x, o.y, o.z));
    }
    return (e.computeVertexNormals(), e);
  };
  for (let t = 0; t < 34; t++) {
    let t, n;
    do {
      ((t = rand(-80, 80)), (n = rand(-80, 80)));
    } while (e.some(e => Math.hypot(t - e.x, n - e.z) < e.r + 3));
    const a = rand(0.5, 1.7),
      r = a * rand(0.5, 0.9),
      s = a * rand(1, 1.5),
      l = rand(0, 3);
    (addGeo(c(), 'rock', t, o(t, n) + 0.3 * r, n, { s: [s, r, a], ry: l }),
      addColR(t, n, l, 1.8 * s, 1.8 * a, o(t, n) - 1, o(t, n) + 1.15 * r, 'concrete'));
  }
  for (let t = 0; t < 14; t++) {
    let t, n;
    do {
      ((t = rand(-75, 75)), (n = rand(-75, 75)));
    } while (e.some(e => Math.hypot(t - e.x, n - e.z) < e.r + 4));
    const a = rand(4, 8),
      r = rand(0.25, 0.4),
      s = RNG() < 0.5,
      l = Math.max(o(t - 2, n), o(t + 2, n), o(t, n)) + 0.6 * r;
    (addGeo(cylGeo(r, 1.1 * r, a, 10, 2, 3), 'bark', t, l, n, { rz: s ? Math.PI / 2 : 0, rx: s ? 0 : Math.PI / 2 }),
      s
        ? addCol(t - a / 2, l - r - 1, n - r, t + a / 2, l + r, n + r, 'wood')
        : addCol(t - r, l - r - 1, n - a / 2, t + r, l + r, n + a / 2, 'wood'));
  }
  for (const [e, t] of [
    [4.5, -4.6],
    [-27, 24],
    [30, -15]
  ])
    addBox(e, o(e, t), t, 2.4, 1.1, 0.9, 'logs');
  const d = [];
  let u = 0;
  for (; d.length < 420 && u < 6e3;) {
    u++;
    const t = rand(-92, 92),
      o = rand(-92, 92);
    e.some(e => Math.hypot(t - e.x, o - e.z) < e.r + 3.5) ||
      d.some(e => Math.hypot(e.x - t, e.z - o) < 3.2) ||
      d.push({ x: t, z: o, h: rand(11, 19), r: rand(0.2, 0.38) });
  }
  const p = cylGeo(0.62, 1, 1, 10, 2, 4);
  p.translate(0, 0.5, 0);
  const m = new THREE.InstancedMesh(p, M('bark'), d.length);
  ((m.castShadow = !0), (m.receiveShadow = !0));
  const h = [];
  for (let e = 0; e < 2; e++) {
    const t = new THREE.ConeGeometry(1, 1, 9, 3, !0);
    t.translate(0, 0.5, 0);
    const o = t.attributes.position,
      n = new Float32Array(3 * o.count);
    for (let t = 0; t < o.count; t++) {
      const a = o.getY(t),
        r = o.getX(t),
        s = o.getZ(t),
        l = Math.atan2(s, r),
        i = 1 + 0.6 * (nz.v(3 * l + 10 * e, 4 * a) - 0.5);
      a < 0.99 && (o.setX(t, r * i), o.setZ(t, s * i));
      const c = 0.18 + 0.3 * a;
      ((n[3 * t] = c), (n[3 * t + 1] = c), (n[3 * t + 2] = c));
    }
    (t.setAttribute('color', new THREE.BufferAttribute(n, 3)), t.computeVertexNormals(), h.push(t));
  }
  const f = M('needles').clone();
  ((f.vertexColors = !0), (f.side = THREE.DoubleSide), (f.userData.own = !0));
  const g = h.map(e => {
    const t = new THREE.InstancedMesh(e, f, 2 * d.length + 10);
    return ((t.castShadow = !0), (t.receiveShadow = !0), (t.count = 0), t);
  });
  SPR.branch ||
    (SPR.branch = canvasTex(
      512,
      (e, t, o) => {
        const n = (t, o, n, a, r, s) => {
          ((e.strokeStyle = 'rgb(52,40,28)'), (e.lineWidth = r), e.beginPath(), e.moveTo(t, o));
          const l = t + Math.cos(n) * a,
            i = o + Math.sin(n) * a;
          (e.lineTo(l, i), e.stroke());
          for (let r = 0; r < a; r += s) {
            const s = t + Math.cos(n) * r,
              l = o + Math.sin(n) * r;
            for (const t of [-1, 1]) {
              const o = n + t * (0.8 + 0.5 * Math.random()) - 0.15,
                i = (11 + 9 * Math.random()) * (1 - (r / a) * 0.45),
                c = 0.55 + 0.6 * Math.random();
              ((e.strokeStyle = `rgb(${(26 * c) | 0},${(50 * c) | 0},${(27 * c) | 0})`),
                (e.lineWidth = 1.6),
                e.beginPath(),
                e.moveTo(s, l),
                e.lineTo(s + Math.cos(o) * i, l + Math.sin(o) * i),
                e.stroke());
            }
          }
          return [l, i];
        };
        let a = 6,
          r = 0.32 * o;
        for (let e = 0; e < 10; e++) {
          const t = 0.1 + 0.025 * e,
            o = 48,
            s = a + Math.cos(t) * o,
            l = r + Math.sin(t) * o;
          for (const s of [-1, 1])
            n(
              a + Math.cos(t) * o * 0.45,
              r + Math.sin(t) * o * 0.45,
              t + s * (0.7 + 0.3 * Math.random()),
              (46 - 3 * e) * (0.8 + 0.4 * Math.random()),
              2,
              3
            );
          (n(a, r, t, o, 4.5 - 0.35 * e, 3.2), (a = s), (r = l));
        }
      },
      !0,
      256
    ));
  const v = new THREE.PlaneGeometry(1, 0.5, 6, 1);
  v.translate(0.5, -0.07, 0);
  {
    const e = v.attributes.position;
    for (let t = 0; t < e.count; t++) {
      const o = e.getX(t);
      (e.setY(t, e.getY(t) - o * o * 0.18), e.setZ(t, 0.03 * Math.sin(3 * o)));
    }
    v.computeVertexNormals();
  }
  const T = new THREE.MeshStandardMaterial({
    map: SPR.branch,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.85
  });
  ((T.userData.own = !0),
    (T.onBeforeCompile = e => {
      ((e.uniforms.uT = GT),
        (e.vertexShader =
          'uniform float uT;\n' +
          e.vertexShader.replace(
            '#include <begin_vertex>',
            '#include <begin_vertex>\n    #ifdef USE_INSTANCING\n    float ph=instanceMatrix[3].x*.21+instanceMatrix[3].z*.17+instanceMatrix[3].y*.3;\n    #else\n    float ph=0.;\n    #endif\n    transformed.y+=sin(uT*1.1+ph)*.05*uv.x;transformed.z+=cos(uT*.8+ph)*.04*uv.x;'
          )));
    }));
  const b = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      map: SPR.branch,
      alphaTest: 0.5,
      side: THREE.DoubleSide
    }),
    y = new THREE.InstancedMesh(v, T, 70 * d.length);
  ((y.castShadow = !0), (y.receiveShadow = !0), (y.customDepthMaterial = b));
  let x = 0;
  const w = new THREE.Color(),
    E = new THREE.Matrix4(),
    S = new THREE.Quaternion(),
    G = V3();
  (d.forEach((e, t) => {
    const n = o(e.x, e.z) - 0.4;
    (S.setFromEuler(_e.set(rand(-0.03, 0.03), rand(0, TAU), rand(-0.03, 0.03))),
      E.compose(V3(e.x, n, e.z), S, G.set(e.r, e.h, e.r)),
      m.setMatrixAt(t, E),
      addCyl(e.x, e.z, 0.85 * e.r, n, n + e.h, 'wood'));
    for (let o = 0; o < 3; o++) {
      const a = o / 2,
        r = n + e.h * (0.32 + 0.45 * a),
        s = lerp(1.5, 0.5, a) * (e.h / 15),
        l = lerp(4.5, 3.5, a) * (e.h / 15),
        i = g[(t + o) % 2];
      i.count < i.instanceMatrix.count &&
        (S.setFromEuler(_e.set(0, rand(0, TAU), 0)),
        E.compose(V3(e.x, r, e.z), S, G.set(s, l, s)),
        i.setMatrixAt(i.count++, E));
    }
    const a = n + 0.28 * e.h,
      r = n + 0.99 * e.h;
    let s = 0;
    for (let t = a; t < r && s < 70; t += rand(0.35, 0.55)) {
      const o = (t - a) / (r - a),
        n = lerp(3.8, 0.6, Math.pow(o, 0.85)) * (e.h / 15) * rand(0.85, 1.15),
        l = o > 0.8 ? 4 : 6,
        i = rand(0, TAU);
      for (let a = 0; a < l && s < 70; a++, s++) {
        const r = i + (a / l) * TAU + rand(-0.3, 0.3),
          s = Math.random() < 0.6 ? rand(1.1, 1.5) : rand(0.2, 0.6),
          c = -lerp(0.35, 0.05, o) + rand(-0.12, 0.12);
        (_e.set(s, r, c, 'YZX'),
          S.setFromEuler(_e),
          (_e.order = 'XYZ'),
          E.compose(V3(e.x, t, e.z), S, G.set(n, n, n)),
          y.setMatrixAt(x, E));
        const d = rand(0.7, 1.15);
        (w.setRGB(d, d * rand(0.95, 1.05), d), y.setColorAt(x, w), x++);
      }
    }
  }),
    (y.count = x),
    y.instanceColor && (y.instanceColor.needsUpdate = !0),
    LV.group.add(m, y, ...g),
    g.forEach(e => (e.instanceMatrix.needsUpdate = !0)),
    (y.instanceMatrix.needsUpdate = !0));
  const P = new THREE.PlaneGeometry(1, 1);
  P.translate(0, 0.5, 0);
  const A = P.clone().rotateY(Math.PI / 2),
    R = mergeGeos([P, A]),
    k = e => {
      const t = new THREE.MeshStandardMaterial({ map: e, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9 });
      return (
        (t.userData.own = !0),
        (t.onBeforeCompile = e => {
          ((e.uniforms.uT = GT),
            (e.vertexShader =
              'uniform float uT;\n' +
              e.vertexShader.replace(
                '#include <begin_vertex>',
                '#include <begin_vertex>\n      #ifdef USE_INSTANCING\n      float ph=instanceMatrix[3].x*.31+instanceMatrix[3].z*.27;\n      #else\n      float ph=0.;\n      #endif\n      transformed.x+=sin(uT*1.6+ph)*.09*uv.y;transformed.z+=cos(uT*1.3+ph)*.06*uv.y;'
              )));
        }),
        t
      );
    };
  for (const [t, n, a] of [
    [SPR.grass, 2600, 0.75],
    [SPR.fern, 900, 1.1]
  ]) {
    const r = new THREE.InstancedMesh(R, k(t), n);
    let s = 0;
    for (let t = 0; t < 3 * n && s < n; t++) {
      const t = rand(-85, 85),
        n = rand(-85, 85);
      if (e.some(e => Math.hypot(t - e.x, n - e.z) < e.r + 0.5)) continue;
      const l = a * rand(0.6, 1.3);
      (S.setFromEuler(_e.set(0, rand(0, TAU), 0)),
        E.compose(V3(t, o(t, n) - 0.05, n), S, G.set(1.3 * l, l, 1.3 * l)),
        r.setMatrixAt(s++, E));
    }
    ((r.count = s), (r.receiveShadow = !0), LV.group.add(r));
  }
  const V = new THREE.DirectionalLight(16756848, 2.6);
  (V.position.set(80, 26, -40), (LV.sun = V));
  const z = new THREE.HemisphereLight(9414333, 2762264, 0.75);
  ((LV.hemi = z),
    LV.group.add(z, V, V.target),
    (LV.skyCfg = {
      top: 3951971,
      hor: 12036506,
      bot: 2763302,
      sun: V3(0.85, 0.27, -0.42),
      sunCol: 16753242,
      sunSize: 700,
      glow: 1.3,
      clouds: 0.75,
      cloudCol: 9080726,
      mul: 1.6
    }),
    (LV.fog = new THREE.FogExp2(8029578, 0.032)),
    (LV.post = {
      exp: 0.95,
      grade: [1.02, 1, 0.95],
      sat: 0.72,
      haze: 0,
      bloomThr: 1.6,
      flash: !1,
      ambience: 'forest',
      reverb: 'forest',
      shadowR: 55,
      envK: 0.22,
      skyK: 1.1
    }),
    (LV.wps = []));
  for (let e = -72; e <= 72; e += 12)
    for (let t = -72; t <= 72; t += 12) {
      const o = e + rand(-3, 3),
        n = t + rand(-3, 3);
      d.some(e => Math.hypot(e.x - o, e.z - n) < 1.2) || LV.wps.push({ x: o, z: n });
    }
  LV.wps.push(
    { x: 0, z: 5 },
    { x: 0, z: 0, yh: e[0].h + 0.5 },
    { x: 28, z: -14 },
    { x: 28, z: -18, yh: e[2].h + 0.5 },
    { x: -24, z: -30 },
    { x: -24, z: -34, yh: e[3].h + 0.5 },
    { x: 14, z: 38 }
  );
  for (const e of LV.wps) void 0 === e.yh && (e.yh = o(e.x, e.z));
  ((LV.spawns = [
    [0, -14],
    [-30, 14],
    [28, -8],
    [-40, -40],
    [45, 40],
    [-50, 30],
    [50, -40],
    [14, 48],
    [-10, 40],
    [40, 0],
    [-55, -5],
    [10, -45]
  ]),
    (LV.preview = [
      { p: [6, o(6, 18) + 1.4, 18], q: [6, o(6, 14) + 1.6, 14], l: [6, o(6, 8) + 1.2, 8] },
      { p: [-16, o(-16, 12) + 1.5, 12], q: [-12, o(-12, 9) + 1.6, 9], l: [0, 1.5 + e[0].h, 0] },
      { p: [32, o(32, -4) + 1.6, -4], q: [30, o(30, -8) + 1.7, -8], l: [28, e[2].h + 1.3, -18] }
    ]),
    (LV.clock = [19, 12, 40]));
}
