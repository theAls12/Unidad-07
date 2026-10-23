/* Brazos y manos en primera persona */
const HANDS = {};
function loadHands() {
  return Promise.all(
    ['left', 'right'].map(
      e =>
        new Promise(t => {
          try {
            gltfLoader().parse(
              b64buf(HAND_GLB[e]),
              '',
              o => {
                ((HANDS[e] = o), t());
              },
              () => t()
            );
          } catch (e) {
            t();
          }
        })
    )
  );
}
function curlChain(e, t, o) {
  for (let n = 0; n < t.length; n++) {
    const a = e[n + 1].position.clone(),
      r = new THREE.Quaternion().setFromAxisAngle(o, t[n]);
    for (let t = n + 1; t < e.length; t++) {
      const o = e[t];
      (t > n + 1 && o.position.sub(a).applyQuaternion(r).add(a), o.quaternion.premultiply(r));
    }
  }
}
function handInstance(e, t, o, n, a, r, s) {
  const l = new THREE.Group();
  return HANDS[e]
    ? (gltfLoader().parse(b64buf(HAND_GLB[e]), '', i => {
        const c = i.scene,
          d = e => c.getObjectByName(e),
          u = 'left' === e ? 1 : -1,
          p = V3(0, 0, 1);
        for (const e of ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger']) {
          const o = t[e] || t.fingers;
          curlChain(
            [
              d(e + '-metacarpal'),
              d(e + '-phalanx-proximal'),
              d(e + '-phalanx-intermediate'),
              d(e + '-phalanx-distal'),
              d(e + '-tip')
            ],
            o.map(e => e * u),
            p
          );
        }
        t.thumb &&
          curlChain(
            [d('thumb-metacarpal'), d('thumb-phalanx-proximal'), d('thumb-phalanx-distal'), d('thumb-tip')],
            t.thumb.map(e => e * u),
            V3(...t.thumbAxis)
          );
        const m = d('index-finger-phalanx-proximal').position.clone(),
          h = d('pinky-finger-phalanx-proximal').position.clone(),
          f = d('wrist').position.clone(),
          g = h.clone().sub(m).normalize(),
          v = m.clone().add(h).multiplyScalar(0.5).sub(f).normalize();
        let T = V3().crossVectors(g, v).normalize();
        ('right' === e && T.negate(), V3().crossVectors(T, g).normalize());
        const b = new THREE.Matrix4().makeBasis(g, T, V3().crossVectors(g, T)),
          y = n.clone().normalize(),
          x = V3()
            .copy(a)
            .sub(y.clone().multiplyScalar(a.dot(y)))
            .normalize(),
          M = new THREE.Matrix4().makeBasis(y, x, V3().crossVectors(y, x)).multiply(b.clone().transpose());
        l.quaternion.setFromRotationMatrix(M);
        const w = d(r[0]).position.clone().applyQuaternion(l.quaternion);
        (l.position.copy(r[1]).sub(w),
          c.traverse(e => {
            e.isMesh && ((e.material = o), (e.castShadow = !1), (e.receiveShadow = !0), (e.frustumCulled = !1));
          }),
          l.add(c),
          l.traverse(e => e.layers.set(1)),
          s && (l.updateMatrixWorld(!0), s(d('wrist').getWorldPosition(V3()), l)));
      }),
      l)
    : l;
}
function gloveMat() {
  const e = genPBR('fabric'),
    t = new THREE.MeshStandardMaterial({
      map: e.map,
      normalMap: e.normalMap,
      roughnessMap: e.rm,
      color: 3816245,
      roughness: 1,
      skinning: !0
    });
  return (t.color.convertSRGBToLinear(), t.normalScale.set(1.5, 1.5), t);
}
function sleeveGeo(e, t, o) {
  const n = [];
  for (let a = 0; a <= 28; a++) {
    const r = a / 28;
    n.push(V2(lerp(t, o, r) * (1 + 0.06 * Math.sin(31 * r) + 0.03 * Math.sin(87 * r)), -r * e));
  }
  n.reverse();
  const a = new THREE.LatheGeometry(n, 28),
    r = a.attributes.position;
  for (let e = 0; e < r.count; e++) {
    const t = r.getY(e),
      o = Math.atan2(r.getZ(e), r.getX(e)),
      n = 1 + 0.08 * (nz.v(2 * o + 5, 35 * t) - 0.5);
    (r.setX(e, r.getX(e) * n), r.setZ(e, r.getZ(e) * n));
  }
  return (a.computeVertexNormals(), scaleUV(a, 4));
}
function addSleeve(e, t, o, n, a, r, s) {
  const l = new THREE.Group();
  (e.add(l), l.position.copy(o), l.quaternion.setFromUnitVectors(V3(0, -1, 0), n.clone().normalize()));
  const i = new THREE.Mesh(sleeveGeo(a, r, s), t);
  ((i.position.y = 0.015), l.add(i));
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.92 * r, 0.98 * r, 0.05, 24), M('polymer'));
  ((c.position.y = -0.005),
    l.add(c),
    l.traverse(e => {
      (e.layers.set(1), e.isMesh && (e.castShadow = !1));
    }));
}
function buildArms(e, t, o) {
  const n = gloveMat(),
    a = fabricMat(t, !1);
  a.normalScale.set(2, 2);
  const r = { rifle: -0.3, smg: -0.25, dmr: -0.36, sniper: -0.34, shotgun: -0.31, pistol: 0, knife: 0 }[o],
    s = { rifle: 0.03, dmr: 0.03, smg: 0.022, sniper: 0.045, shotgun: 0.025, pistol: 0.045, knife: 0.055 }[o],
    l = { rifle: -0.052, dmr: -0.052, smg: -0.048, sniper: -0.075, shotgun: -0.04, pistol: -0.045, knife: -0.012 }[o],
    i = new THREE.Group();
  e.add(i);
  const c = handInstance(
    'right',
    { fingers: [1.55, 1.45, 0.9], 'index-finger': [0.25, 0.3, 0.2], thumb: [0.6, 0.3, 0.2], thumbAxis: [0, 1, 0] },
    n,
    V3(0, -1, 0.38),
    V3(-1, 0, 0),
    ['middle-finger-phalanx-proximal', V3(0.03, l - 0.022, s - 0.032)],
    (e, t) => {
      const o = i.worldToLocal(e.clone());
      addSleeve(i, a, o, V3(0.35, -0.55, 0.75), 0.5, 0.042, 0.06);
    }
  );
  i.add(c);
  const d = new THREE.Group();
  ((d.position.z = r), (d.userData.z0 = r), e.add(d));
  const u = { shotgun: -0.07, sniper: -0.088 }[o] || -0.04;
  if ('knife' === o) return { R: i, L: d, lh: null, rh: c };
  const p =
    'pistol' === o
      ? handInstance(
          'left',
          { fingers: [1.35, 1.3, 0.8], thumb: [0.2, 0.2, 0.1], thumbAxis: [1, 0, 0] },
          n,
          V3(0, -1, 0.4),
          V3(1, 0, 0),
          ['middle-finger-phalanx-proximal', V3(-0.045, l - 0.035, s - 0.025)],
          (e, t) => {
            const o = d.worldToLocal(e.clone());
            addSleeve(d, a, o, V3(-0.45, -0.55, 0.75), 0.55, 0.042, 0.065);
          }
        )
      : handInstance(
          'left',
          { fingers: [1.25, 1.2, 0.7], thumb: [0.25, 0.25, 0.15], thumbAxis: [1, 0, 0] },
          n,
          V3(0, 0, 1),
          V3(0, 1, 0),
          ['middle-finger-phalanx-proximal', V3(0.022, u - 0.012, 0)],
          (e, t) => {
            const o = d.worldToLocal(e.clone());
            addSleeve(d, a, o, V3(-0.55, -0.45, 0.7), 0.6, 0.042, 0.065);
          }
        );
  return (d.add(p), { R: i, L: d, lh: p, rh: c });
}
