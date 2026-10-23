/* Mapa: escuela abandonada */
function buildSchool() {
  ((LV.name = 'school'),
    (LV.bounds = 44),
    (LV.tsurf = 'concrete'),
    addBox(0, -0.4, 0, 100, 0.4, 84, 'asphalt'),
    addBox(0, -0.2, 0, 60.2, 0.22, 40.2, 'lino', { cast: !1 }),
    addBox(-18, -0.19, -11, 23.6, 0.22, 17.6, 'wood', { cast: !1 }),
    addBox(0, 3.4, 9.1, 60.4, 0.35, 22.2, 'ceiling'),
    addBox(12.1, 3.4, -11.1, 36.2, 0.35, 18.2, 'ceiling'),
    addBox(-18, 6.2, -11, 24.6, 0.35, 18.6, 'concrete'));
  const e = 0.3;
  wall(-30, 20, 30, 20, {
    h: 3.4,
    t: e,
    mk: 'brick',
    frame: !0,
    boards: 0.4,
    ops: [
      WIN(3),
      WIN(6.5),
      WIN(10),
      WIN(15),
      WIN(18.5),
      WIN(22),
      { o: 27, w: 6, b: 0, t: 2.7 },
      WIN(35),
      WIN(38.5),
      WIN(42),
      WIN(47),
      WIN(50.5),
      WIN(54)
    ]
  });
  const t = e => ({ o: e, w: 2.2, b: 4, t: 5.4 });
  (wall(-30, -20, -6, -20, { h: 6.2, t: e, mk: 'brick', frame: !0, ops: [t(2), t(7), t(12), t(17)] }),
    wall(-6, -20, 30, -20, {
      h: 3.4,
      t: e,
      mk: 'brick',
      frame: !0,
      boards: 0.4,
      ops: [WIN(2), WIN(6), WIN(10), DOOR(12.6, 1.3), { o: 18, w: 1.2, b: 2, t: 2.6 }, WIN(26), WIN(30)]
    }),
    wall(-30, -20, -30, -2, { h: 6.2, t: e, mk: 'brick', frame: !0, ops: [t(3), t(9), t(14)] }),
    wall(-30, -2, -30, 2, { h: 3.4, t: e, mk: 'brick', ops: [DOOR(1.4, 1.3)] }),
    wall(-30, 2, -30, 20, {
      h: 3.4,
      t: e,
      mk: 'brick',
      frame: !0,
      boards: 0.4,
      ops: [WIN(3), WIN(7), WIN(11), WIN(14.5)]
    }),
    wall(30, -20, 30, -2, { h: 3.4, t: e, mk: 'brick', frame: !0, boards: 0.4, ops: [WIN(3), WIN(8), WIN(13)] }),
    wall(30, -2, 30, 2, { h: 3.4, t: e, mk: 'brick', ops: [DOOR(1.4, 1.3)] }),
    wall(30, 2, 30, 20, {
      h: 3.4,
      t: e,
      mk: 'brick',
      frame: !0,
      boards: 0.4,
      ops: [WIN(3), WIN(7), WIN(11), WIN(14.5)]
    }),
    wall(-30, 2, 30, 2, { ops: [DOOR(7), DOOR(19), { o: 26, w: 8, b: 0, t: 3.4 }, DOOR(39), DOOR(51)] }),
    wall(-30, -2, -6, -2, { h: 6.2, ops: [DOOR(5), DOOR(15, 2.4, 2.4)] }),
    wall(-6, -2, 30, -2, { ops: [{ o: 5, w: 4, b: 0, t: 2.6 }, DOOR(19.5), DOOR(29)] }),
    wall(-16, 2, -16, 20, { ops: [{ o: 9, w: 1.4, b: 0, t: 1.9 }] }),
    wall(-4, 2, -4, 20, { ops: [DOOR(10)] }),
    wall(4, 2, 4, 20, { ops: [DOOR(14)] }),
    wall(16, 2, 16, 20, { ops: [DOOR(4)] }),
    wall(-6, -20, -6, -2, { h: 6.2, ops: [DOOR(6, 1.4)] }),
    wall(10, -20, 10, -2, { ops: [DOOR(9)] }),
    wall(18, -20, 18, -2, { ops: [DOOR(3)] }));
  const o = (e, t) => {
    let o = -29.6;
    t.sort((e, t) => e[0] - t[0]);
    for (const [n, a] of t)
      (n - o > 0.6 && addBox((o + n) / 2, 0, e, n - o - 0.1, 1.9, 0.45, 'locker', { surf: 'metal' }),
        (o = Math.max(o, a)));
    29.6 - o > 0.6 && addBox((o + 29.6) / 2, 0, e, 29.6 - o - 0.1, 1.9, 0.45, 'locker', { surf: 'metal' });
  };
  (o(1.65, [
    [-23.2, -21.6],
    [-11.2, -9.6],
    [-4.2, 4.2],
    [8.8, 10.4],
    [20.8, 22.4]
  ]),
    o(-1.65, [
      [-25.2, -23.6],
      [-15.2, -12.4],
      [-6.2, -5.8],
      [-1.2, 3.2],
      [13.3, 14.9],
      [22.8, 24.4]
    ]),
    addBox(-7.5, 0, -0.4, 1.9, 0.45, 0.47, 'locker', { surf: 'metal', ry: 0.15 }),
    addBox(17, 0, 0.3, 2, 0.46, 1.85, 'locker', { surf: 'metal' }));
  const n = (e, t, o, n, a) => {
    const r = (e + t) / 2;
    for (let n = 0; n < 4; n++)
      for (let r = 0; r < 3; r++) {
        const s = e + 2 + n * ((t - e - 4) / 3),
          l = o + 3.5 + 3.6 * r,
          i = hash2(s + a, l);
        i < 0.15 || desk(s + rand(-0.2, 0.2), l + rand(-0.2, 0.2), Math.PI + rand(-0.25, 0.25), i > 0.85);
      }
    (addBox(r, 0, n - 1.6, 1.6, 0.78, 0.8, 'planks'), addBox(r, 1, n - 0.13, 4, 1.2, 0.05, 'chalk', { collide: !1 }));
  };
  (n(-29.8, -16.2, 2.2, 19.8, 1),
    n(-15.8, -4.2, 2.2, 19.8, 2),
    n(4.2, 15.8, 2.2, 19.8, 3),
    n(16.2, 29.8, 2.2, 19.8, 4),
    addBox(0, 0, 12, 4, 1.1, 1, 'planks'),
    addBox(-3.2, 0, 17, 1.4, 2, 0.5, 'planks'));
  for (let e = 0; e < 3; e++)
    for (let t = 0; t < 2; t++) {
      const o = 4.2 * e - 3,
        n = -7 - 6 * t;
      (addBox(o, 0.72, n, 1, 0.05, 3.2, 'planks', { collide: !1 }),
        addBox(o, 0, n, 0.08, 0.72, 2.6, 'rust', { collide: !1 }),
        colR(o, n, 0, 1, 3.2, 0, 0.77, 'wood'),
        hash2(e, t) > 0.4 && addBox(o - 0.85, 0, n, 0.35, 0.45, 3, 'planks'),
        addBox(o + 0.85, 0, n, 0.35, 0.45, 3, 'planks'));
    }
  addBox(-1, 0, -19, 9, 1, 0.9, 'locker');
  for (let e = 0; e < 3; e++) addBox(11.2 + 2 * e, 0, -16, 0.06, 2, 2.6, 'locker');
  (addBox(24, 0, -10, 2, 0.78, 1, 'planks'),
    addBox(28.6, 0, -15, 0.6, 1.4, 3, 'locker'),
    addBox(21, 0, -18.8, 3, 2, 0.6, 'locker'));
  for (let e = 0; e < 4; e++) {
    const t = 0.85 * e - 19.4,
      o = 0.45 * (4 - e);
    (addBox(-18, 0, t, 20, o - 0.04, 0.85, 'paint'),
      addBox(-18, o - 0.04, t + 0.06, 20, 0.05, 0.72, 'wood', { collide: !1 }),
      addCol(-28, o - 0.04, t - 0.425, -8, o + 0.01, t + 0.425, 'wood'));
  }
  const a = (e, t) => {
    (addBox(e, 0, -11, 0.16, 3.2, 0.16, 'rust'),
      addBox(e + 0.6 * t, 2.8, -11, 0.05, 1.05, 1.8, 'polymer', { collide: !1 }));
  };
  (a(-29.2, 1), a(-6.8, -1));
  for (let e = 0; e < 9; e++) {
    const e = rand(-27, -9),
      t = rand(-14, -4);
    RNG() < 0.5 && addBox(e, 0, t, 0.45, 0.45, 0.45, 'planks', { ry: rand(0, 3) });
  }
  for (let e = 0; e < 40; e++)
    addBox(rand(-29, 29), 0, rand(-19, 19), rand(0.5, 1.2), 0.03, rand(0.5, 1.2), 'ceiling', {
      ry: rand(0, 3),
      rx: rand(-0.1, 0.1),
      collide: !1,
      cast: !1
    });
  for (let e = 0; e < 10; e++)
    addBox(rand(-27, 27), 0, rand(-1.4, 1.4), rand(0.2, 0.5), rand(0.1, 0.3), rand(0.2, 0.5), 'concrete', {
      ry: rand(0, 3),
      collide: !1
    });
  (addBox(-10, 0, 0, 1.8, 0.95, 0.5, 'locker', { ry: 0.4 }), addBox(8, 0, -0.3, 0.6, 0.7, 1.6, 'planks', { ry: -0.3 }));
  for (let e = 0; e < 3; e++) addBox(0.4 * e - 40, 0, 3 * e - 14, 1.4, 1.4, 2.2, 'rust');
  (car(-38, 8, 0.3),
    car(36, -14, 1.2),
    car(12, 28, 1.5),
    car(-24, 30, 1.68),
    bus(22, -30, 0.05),
    addBox(0, 0, -30, 8, 1.2, 0.4, 'concrete'),
    addBox(-14, 0, 26, 0.4, 1, 7, 'concrete'),
    addBox(38, 0, 18, 3, 1.4, 1.6, 'rust'));
  const r = new THREE.MeshStandardMaterial({
    map: SPR.chain,
    transparent: !0,
    alphaTest: 0.4,
    side: THREE.DoubleSide,
    roughness: 0.5,
    metalness: 0.8
  });
  r.userData.own = !0;
  const s = (e, t, o, n) => {
    const a = SPR.chain.clone();
    ((a.needsUpdate = !0), a.repeat.set(o / 1.2, 2.2 / 1.2));
    const s = r.clone();
    ((s.map = a),
      (s.userData.own = !0),
      mesh(new THREE.PlaneGeometry(o, 2.2), s, e, 1.1, t, { ry: n, cast: !1 }),
      Math.abs(Math.cos(n)) > 0.5
        ? addCol(e - o / 2, 0, t - 0.05, e + o / 2, 2.2, t + 0.05, 'metal', !0)
        : addCol(e - 0.05, 0, t - o / 2, e + 0.05, 2.2, t + o / 2, 'metal', !0));
  };
  (s(0, 42, 88, 0), s(0, -42, 88, 0), s(44, 0, 84, Math.PI / 2), s(-44, 0, 84, Math.PI / 2));
  for (let e = -44; e <= 44; e += 4)
    (addBox(e, 0, 42, 0.06, 2.3, 0.06, 'rust', { collide: !1 }),
      addBox(e, 0, -42, 0.06, 2.3, 0.06, 'rust', { collide: !1 }));
  for (let e = 0; e < 70; e++) {
    const e = decal(SPR.paper, rand(-29, 29), 0.03, rand(-19, 19), 0.22, 0.3, rand(0, TAU), { rx: -Math.PI / 2 });
    ((e.rotation.z = rand(0, TAU)), (e.castShadow = !1));
  }
  const l = emissiveMat(15134975, 5),
    i = emissiveMat(2236962, 0),
    c = new THREE.BoxGeometry(1.25, 0.06, 0.22),
    d = [];
  for (let e = -26; e <= 26; e += 6.5) {
    const t = [-19.5, 6.5, 19.5].some(t => Math.abs(t - e) < 0.1),
      o = mesh(c, t ? l.clone() : i, e, 3.33, 0, { cast: !1 });
    if (t) {
      o.material.userData.own = !0;
      const t = pLight(e, 3.1, 0, 14280447, 9, 8, 1);
      (d.push([o, t]), LV.hum.push(t.position));
    }
  }
  for (const [e, t] of [
    [10, 10],
    [-22, 9],
    [-18, -11],
    [-24, -15],
    [-12, -7]
  ])
    mesh(c, i, e, e < -6 && t < -2 ? 6.13 : -22 === e ? 3.02 : 3.33, t, { cast: !1, rz: -22 === e ? 0.6 : 0 });
  const u = pLight(10, 3, 12, 14280447, 10, 8, 1),
    p = mesh(c, l.clone(), 10, 3.33, 12, { cast: !1 });
  ((p.material.userData.own = !0), d.push([p, u]), LV.hum.push(u.position));
  const m = pLight(-18, 5.5, -11, 16722450, 14, 10, 0.3);
  mesh(new THREE.SphereGeometry(0.09, 10, 8), emissiveMat(16723984, 30), -18, 5.95, -11.6, { cast: !1 });
  const h = pLight(0, 6.5, 35, 16752704, 90, 18, 0.05);
  (addBox(0, 0, 35.4, 0.18, 6.8, 0.18, 'rust'),
    mesh(new THREE.BoxGeometry(0.5, 0.12, 0.3), emissiveMat(16756832, 25), 0, 6.6, 35, { cast: !1 }));
  const f = emissiveMat(16777215, 1);
  ((f.map = signTex('SALIDA', '#0f8a3a', '#eaffef')),
    (f.emissiveMap = f.map),
    (f.emissiveIntensity = 4),
    mesh(new THREE.BoxGeometry(0.04, 0.3, 0.8), f, -29.8, 2.7, 0, { cast: !1 }),
    mesh(new THREE.BoxGeometry(0.04, 0.3, 0.8), f, 29.8, 2.7, 0, { cast: !1, ry: Math.PI }),
    pLight(-29, 2.7, 0, 3211120, 5, 6),
    LV.tick.push(e => {
      for (const [t, o] of d) {
        const n = o.userData;
        let a = 1;
        (n.flick &&
          (a = Math.sin(37 * e + n.ph) * Math.sin(3.1 * e + 2 * n.ph) > 0.92 ? 0.08 : Math.random() < 0.015 ? 0.2 : 1),
          (o.intensity = n.base * a),
          (t.material.emissiveIntensity = 5 * a));
      }
      ((m.intensity = 14 * (0.55 + 0.45 * Math.sin(2.2 * e))), (h.intensity = 90 * (Math.random() < 0.008 ? 0.4 : 1)));
    }));
  const g = new THREE.DirectionalLight(10466528, 0.55);
  (g.position.set(-30, 60, 40), (LV.sun = g));
  const v = new THREE.HemisphereLight(3820138, 657932, 0.05);
  ((LV.hemi = v),
    (LV.indoor = 0.45),
    LV.group.add(v, g, g.target),
    (LV.skyCfg = {
      top: 264470,
      hor: 1713984,
      bot: 131587,
      sun: V3(-0.4, 0.55, 0.55),
      sunCol: 10137820,
      sunSize: 2600,
      glow: 0.45,
      stars: 1.8,
      clouds: 0.3,
      cloudCol: 1712947,
      mul: 1
    }),
    (LV.fog = new THREE.FogExp2(395794, 0.018)),
    (LV.post = {
      exp: 1.7,
      grade: [0.92, 1, 1.08],
      sat: 0.7,
      haze: 0,
      bloomThr: 1.4,
      flash: !0,
      ambience: 'school',
      reverb: 'school',
      shadowR: 50,
      envK: 0.12,
      skyK: 0.5
    }),
    (LV.wps = [
      ...[-27, -21, -15, -9, -3, 3, 9, 15, 21, 27].map(e => ({ x: e, z: 0 })),
      { x: -28.6, z: 0.05 },
      { x: 28.6, z: 0.05 },
      { x: -31.8, z: 0.05 },
      { x: 31.8, z: 0.05 },
      ...[-22.4, -10.4, 9.6, 21.6].flatMap(e => [
        { x: e, z: 1 },
        { x: e, z: 3.4 }
      ]),
      { x: -23, z: 15.5 },
      { x: -23, z: 4.4 },
      { x: -10.2, z: 15.5 },
      { x: 9.9, z: 15.5 },
      { x: 23, z: 4.4 },
      { x: 23, z: 15.5 },
      { x: -16, z: 9.7 },
      { x: -18, z: 16 },
      { x: 0, z: 6 },
      { x: 2.9, z: 12 },
      { x: 0, z: 16.5 },
      { x: 0, z: 18.8 },
      { x: 0, z: 22 },
      ...[-24.4, -13.8, 1, 14.1, 23.6].flatMap(e => [
        { x: e, z: -1 },
        { x: e, z: -3.4 }
      ]),
      { x: -22, z: -9 },
      { x: -12, z: -8 },
      { x: -18, z: -14.5 },
      { x: -26, z: -13 },
      { x: -7.6, z: -13.3 },
      { x: -4.4, z: -13.3 },
      { x: -0.9, z: -10 },
      { x: 3.3, z: -10 },
      { x: 7.5, z: -9 },
      { x: 7.5, z: -16 },
      { x: 7.25, z: -18.6 },
      { x: 7.25, z: -21.6 },
      { x: 14.1, z: -8 },
      { x: 25, z: -7 },
      { x: 25, z: -14 },
      { x: -36, z: 26 },
      { x: -15.5, z: 24 },
      { x: 0, z: 26 },
      { x: 15, z: 24 },
      { x: 36, z: 26 },
      { x: -36, z: 0 },
      { x: 36, z: 0 },
      { x: -36, z: -25 },
      { x: -12, z: -25 },
      { x: 7, z: -25 },
      { x: 20, z: -25 },
      { x: 19, z: -21 },
      { x: 28, z: -21 },
      { x: 36, z: -25 },
      { x: -36, z: 13 },
      { x: 36, z: 13 },
      { x: -36, z: -12 },
      { x: 36, z: -12 }
    ]),
    (LV.spawns = [
      [-27, 0],
      [27, 0],
      [-23, 15],
      [23, 15],
      [0, 16],
      [-20, -10],
      [3.3, -9],
      [25, -12],
      [0, 26],
      [-36, -25],
      [36, 26],
      [36, -25],
      [-36, 26]
    ]),
    (LV.preview = [
      { p: [-27.5, 0.95, 0.35], q: [-23.5, 1.05, 0.3], l: [12, 1.3, 0] },
      { p: [27.5, 1.4, -0.3], q: [23, 1.5, -0.3], l: [-10, 1.2, 0.5] },
      { p: [14.8, 1.3, 18.8], q: [13.2, 1.35, 17], l: [7, 0.9, 7] },
      { p: [-26, 3.1, -18.7], q: [-21.5, 3.05, -18.7], l: [-16, 0.6, -10] },
      { p: [-7, 1.4, 29], q: [-3.5, 1.5, 30.5], l: [2, 0.8, 36] }
    ]),
    (LV.clock = [23, 47, 12]));
}
