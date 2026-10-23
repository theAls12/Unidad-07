/* Efectos: partículas, trazadoras, impactos y sangre */
const FX = { parts: [], tracers: [], shells: [] };
function initFX() {
  const e = e =>
      new THREE.MeshStandardMaterial({
        map: e,
        transparent: !0,
        depthWrite: !1,
        polygonOffset: !0,
        polygonOffsetFactor: -4,
        roughness: 0.9
      }),
    t = new THREE.PlaneGeometry(1, 1);
  ((FX.holes = new THREE.InstancedMesh(t, e(SPR.hole), 220)),
    (FX.holes.count = 0),
    (FX.holes.frustumCulled = !1),
    (FX.holeI = 0),
    (FX.holes.receiveShadow = !0),
    (FX.blood = new THREE.InstancedMesh(t, e(SPR.blood), 80)),
    (FX.blood.count = 0),
    (FX.blood.frustumCulled = !1),
    (FX.bloodI = 0),
    scene.add(FX.holes, FX.blood));
  for (let e = 0; e < 140; e++) {
    const e = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: SPR.smoke, transparent: !0, depthWrite: !1, opacity: 0 })
    );
    ((e.visible = !1), scene.add(e), FX.parts.push({ s: e, life: 0 }));
  }
  const o = new THREE.MeshBasicMaterial({
    color: 16767392,
    transparent: !0,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: !1
  });
  o.toneMapped = !1;
  const n = new THREE.BoxGeometry(0.012, 0.012, 1);
  n.translate(0, 0, -0.5);
  for (let e = 0; e < 24; e++) {
    const e = new THREE.Mesh(n, o);
    ((e.visible = !1), scene.add(e), FX.tracers.push({ m: e, life: 0 }));
  }
  const a = new THREE.CylinderGeometry(0.005, 0.005, 0.045, 6).rotateZ(Math.PI / 2),
    r = new THREE.MeshStandardMaterial({ color: 11569722, metalness: 1, roughness: 0.3 });
  for (let e = 0; e < 24; e++) {
    const e = new THREE.Mesh(a, r);
    ((e.visible = !1), scene.add(e), FX.shells.push({ m: e, v: V3(), life: 0, b: 0 }));
  }
  FX.lights = [];
  for (let e = 0; e < 3; e++) {
    const e = new THREE.PointLight(16756832, 0, 14, 2);
    (e.layers.enableAll(), scene.add(e), FX.lights.push(e));
  }
  ((FX.li = 0), (FX.flashS = []));
  for (let e = 0; e < 8; e++) {
    const e = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: SPR.flash,
        blending: THREE.AdditiveBlending,
        transparent: !0,
        depthWrite: !1,
        color: 16777215
      })
    );
    ((e.visible = !1), (e.material.toneMapped = !1), scene.add(e), FX.flashS.push({ s: e, life: 0 }));
  }
  FX.fi = 0;
}
const _o = new THREE.Object3D();
function addDecal(e, t, o, n, a) {
  (_o.position.copy(o).addScaledVector(n, 0.012),
    _o.lookAt(V3().copy(o).add(n)),
    _o.rotateZ(Math.random() * TAU),
    _o.scale.set(a, a, 1),
    _o.updateMatrix());
  const r = FX[t] % e.instanceMatrix.count;
  (e.setMatrixAt(r, _o.matrix),
    FX[t]++,
    (e.count = Math.min(e.instanceMatrix.count, FX[t])),
    (e.instanceMatrix.needsUpdate = !0));
}
function particle(e, t, o, n) {
  let a = FX.parts.find(e => e.life <= 0);
  a || (a = FX.parts[(Math.random() * FX.parts.length) | 0]);
  const r = a.s;
  ((r.material.map = e),
    (r.material.blending = n.add ? THREE.AdditiveBlending : THREE.NormalBlending),
    r.material.color.set(n.color || 16777215),
    (r.material.toneMapped = !n.add),
    r.position.copy(t),
    (r.visible = !0),
    (a.v = o.clone()),
    (a.life = a.max = n.life || 1),
    (a.s0 = n.size || 0.3),
    (a.s1 = n.grow || 3 * a.s0),
    (a.op = n.op || 0.6),
    (a.g = n.g || 0),
    (a.drag = n.drag || 1.5),
    (r.material.rotation = Math.random() * TAU),
    (a.spin = rand(-1, 1)),
    (r.material.needsUpdate = !0));
}
function updateFX(e) {
  for (const t of FX.parts) {
    if (t.life <= 0) continue;
    t.life -= e;
    const o = t.s;
    if (t.life <= 0) {
      o.visible = !1;
      continue;
    }
    const n = 1 - t.life / t.max;
    ((t.v.y -= t.g * e), t.v.multiplyScalar(Math.exp(-t.drag * e)), o.position.addScaledVector(t.v, e));
    const a = lerp(t.s0, t.s1, 1 - Math.pow(1 - n, 2));
    (o.scale.set(a, a, 1),
      (o.material.opacity = t.op * (n < 0.1 ? n / 0.1 : 1 - (n - 0.1) / 0.9)),
      (o.material.rotation += t.spin * e));
  }
  for (const t of FX.tracers) t.life <= 0 || ((t.life -= e), (t.m.visible = t.life > 0));
  for (const t of FX.shells) {
    if (t.life <= 0) continue;
    ((t.life -= e),
      (t.v.y -= 9.8 * e),
      t.m.position.addScaledVector(t.v, e),
      (t.m.rotation.x += 20 * e),
      (t.m.rotation.y += 13 * e));
    const o = groundAt(t.m.position.x, t.m.position.z, t.m.position.y);
    (t.m.position.y < o + 0.01 &&
      ((t.m.position.y = o + 0.01),
      t.v.y < -1 && t.b < 2
        ? ((t.v.y *= -0.35), (t.v.x *= 0.5), (t.v.z *= 0.5), t.b++, sndShell(t.m.position))
        : t.v.set(0, 0, 0)),
      t.life <= 0 && (t.m.visible = !1));
  }
  for (const t of FX.lights) t.intensity > 0 && (t.intensity = Math.max(0, t.intensity - e * t.userData.dec));
  for (const t of FX.flashS) t.life <= 0 || ((t.life -= e), t.life <= 0 && (t.s.visible = !1));
}
function tracer(e, t) {
  const o = FX.tracers.find(e => e.life <= 0) || FX.tracers[0],
    n = e.distanceTo(t);
  n < 1 || (o.m.position.copy(e), o.m.lookAt(t), o.m.scale.set(1, 1, n), (o.life = 0.05), (o.m.visible = !0));
}
function muzzleLight(e, t = 40) {
  const o = FX.lights[FX.li++ % FX.lights.length];
  (o.position.copy(e), (o.intensity = t), (o.userData.dec = t / 0.06));
}
function muzzleSprite(e, t = 0.5) {
  const o = FX.flashS[FX.fi++ % FX.flashS.length];
  (o.s.position.copy(e),
    o.s.scale.set(t, t, 1),
    (o.s.material.rotation = Math.random() * TAU),
    (o.s.visible = !0),
    (o.life = 0.045));
}
function ejectShell(e, t) {
  const o = FX.shells.find(e => e.life <= 0) || FX.shells[0];
  (o.m.position.copy(e),
    o.v.copy(t).multiplyScalar(rand(1.8, 2.6)),
    (o.v.y += rand(1.2, 2)),
    (o.life = 2.5),
    (o.b = 0),
    (o.m.visible = !0));
}
function impactFX(e, t, o) {
  addDecal(FX.holes, 'holeI', e, t, rand(0.07, 0.11));
  const n =
    { concrete: 12104358, tile: 12104358, metal: 10066329, wood: 9071176, dirt: 7232064, sand: 13678734 }[o] ||
    11184810;
  for (let o = 0; o < 3; o++)
    particle(
      SPR.smoke,
      e,
      V3()
        .copy(t)
        .multiplyScalar(rand(0.6, 1.8))
        .add(V3(rand(-0.4, 0.4), rand(0, 0.6), rand(-0.4, 0.4))),
      { color: n, life: rand(0.7, 1.3), size: 0.08, grow: rand(0.5, 0.9), op: 0.55, drag: 3, g: -0.1 }
    );
  if ('metal' === o || 'concrete' === o || 'tile' === o)
    for (let o = 0; o < 4; o++)
      particle(
        SPR.spark,
        e,
        V3()
          .copy(t)
          .multiplyScalar(rand(2, 5))
          .add(V3(rand(-2, 2), rand(-1, 3), rand(-2, 2))),
        { add: 1, life: rand(0.08, 0.2), size: 0.04, grow: 0.02, op: 1, g: 9, drag: 0.5 }
      );
  sndImpact(o, e);
}
function bloodFX(e, t) {
  for (let o = 0; o < 5; o++)
    particle(
      SPR.smoke,
      e,
      V3()
        .copy(t)
        .multiplyScalar(rand(0.5, 2.5))
        .add(V3(rand(-0.5, 0.5), rand(-0.2, 0.7), rand(-0.5, 0.5))),
      { color: 5900294, life: rand(0.4, 0.8), size: 0.06, grow: rand(0.3, 0.5), op: 0.85, g: 2, drag: 2 }
    );
  const o = rayWorld(e, t, 2.5);
  (o && addDecal(FX.blood, 'bloodI', o.p, o.n, rand(0.35, 0.7)), sndFlesh(e));
}
