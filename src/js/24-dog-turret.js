/* Perro y torreta */
function cyl(e, t, o, n = 10) {
  const a = new THREE.CylinderGeometry(e, t, o, n);
  return (a.translate(0, -o / 2, 0), a);
}
function mk(e, t, o, n = 0, a = 0, r = 0, s = 0, l = 0, i = 0) {
  const c = new THREE.Mesh(e, t);
  return (c.position.set(n, a, r), c.rotation.set(s, l, i), (c.castShadow = !0), (c.receiveShadow = !0), o.add(c), c);
}
function grp(e, t = 0, o = 0, n = 0) {
  const a = new THREE.Group();
  return (a.position.set(t, o, n), e.add(a), a);
}
function makeDog() {
  const e = new THREE.Group(),
    t = fabricMat(7031336),
    o = fabricMat(1709586),
    n = M('polymer'),
    a = grp(e, 0, 0.55, 0);
  (mk(new THREE.BoxGeometry(0.26, 0.28, 0.72), t, a, 0, 0, 0),
    mk(new THREE.BoxGeometry(0.27, 0.16, 0.5), o, a, 0, 0.1, -0.05),
    mk(new THREE.BoxGeometry(0.28, 0.2, 0.35), n, a, 0, 0.06, 0.08));
  const r = grp(a, 0, 0.1, 0.36);
  ((r.rotation.x = -0.5), mk(new THREE.BoxGeometry(0.16, 0.18, 0.22), t, r, 0, 0.06, 0.06));
  const s = grp(r, 0, 0.16, 0.14);
  (mk(new THREE.BoxGeometry(0.18, 0.16, 0.2), t, s),
    mk(new THREE.BoxGeometry(0.1, 0.09, 0.17), o, s, 0, -0.03, 0.17),
    mk(new THREE.ConeGeometry(0.04, 0.11, 4), o, s, -0.06, 0.12, -0.02),
    mk(new THREE.ConeGeometry(0.04, 0.11, 4), o, s, 0.06, 0.12, -0.02));
  const l = grp(a, 0, 0.08, -0.36);
  mk(cyl(0.03, 0.015, 0.35), t, l, 0, 0, 0, -2.2);
  const i = [];
  for (const [e, n] of [
    [-0.09, 0.27],
    [0.09, 0.27],
    [-0.09, -0.27],
    [0.09, -0.27]
  ]) {
    const r = grp(a, e, -0.08, n);
    (mk(cyl(0.04, 0.03, 0.48), n > 0 ? t : o, r), i.push(r));
  }
  return { root: e, body: a, head: s, legs: i, tail: l, mats: [t, o], phase: 0 };
}
function animDog(e, t, o) {
  e.phase += t * o * 3.2;
  const n = Math.min(1, o / 5);
  (e.legs.forEach((t, o) => (t.rotation.x = 0.8 * Math.sin(e.phase + (o < 2 ? 0 : Math.PI) + (o % 2) * 0.4) * n)),
    (e.body.position.y = 0.55 + 0.05 * Math.abs(Math.sin(e.phase)) * n),
    (e.tail.rotation.z = 0.3 * Math.sin(1.5 * e.phase)));
}
function makeTurret() {
  const e = new THREE.Group(),
    t = M('gunmetal'),
    o = M('polymer'),
    n = M('clothKhaki');
  for (let o = 0; o < 3; o++) {
    const n = (o / 3) * TAU;
    mk(cyl(0.025, 0.02, 0.85), t, e, 0, 0.75, 0, 0.5 * Math.cos(n), 0, 0.5 * Math.sin(n));
  }
  const a = grp(e, 0, 0.8, 0);
  (mk(new THREE.BoxGeometry(0.3, 0.22, 0.5), o, a),
    mk(new THREE.BoxGeometry(0.18, 0.2, 0.24), n, a, 0.22, -0.05, 0),
    mk(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8).rotateX(Math.PI / 2), t, a, 0, 0.03, 0.55),
    mk(new THREE.BoxGeometry(0.12, 0.08, 0.12), o, a, 0, 0.16, 0.05));
  const r = grp(a, 0, 0.03, 0.92),
    s = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 4), emissiveMat(16719888, 40));
  return (s.position.set(0, 0.2, 0.05), a.add(s), { root: e, yaw: a, muzzle: r });
}
