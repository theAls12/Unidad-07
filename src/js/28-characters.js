/* Personajes Mixamo: carga, animación, IK y ragdoll */
const RA = {};
function loadImageTex(e, t = !0, o = !0) {
  return new Promise(n => {
    if (!ASSET[e]) return n(null);
    const a = new Image();
    ((a.onload = () => {
      const r = new THREE.Texture(a);
      ((r.needsUpdate = !0),
        t && (r.encoding = THREE.sRGBEncoding),
        o && (r.wrapS = r.wrapT = THREE.RepeatWrapping),
        (r.anisotropy = maxAniso),
        (RA[e] = r),
        n(r));
    }),
      (a.onerror = () => n(null)),
      (a.src = URL.createObjectURL(b64blob(ASSET[e], isWebp(ASSET[e]) ? 'image/webp' : 'image/jpeg'))));
  });
}
async function loadRealAssets() {
  if ('undefined' == typeof ASSET) return;
  const e = [];
  for (const t of ['brick_d', 'wood_d', 'checker_d', 'grass_d']) e.push(loadImageTex(t, !0));
  for (const t of ['brick_b', 'brick_r', 'wood_b', 'wood_r', 'checker_n']) e.push(loadImageTex(t, !1));
  e.push(loadImageTex('lensdirt', !0, !1));
  for (const [t, o] of [
    ['anims', 'anims'],
    ['char_gas', 'gas'],
    ['char_sol2', 'sol2']
  ])
    e.push(
      new Promise(e => {
        try {
          gltfLoader().parse(
            b64buf(ASSET[t]),
            '',
            t => {
              ((RA[o] = t), e());
            },
            () => e()
          );
        } catch (t) {
          e();
        }
      })
    );
  await Promise.all(e);
  for (const e of ['gas', 'sol2'])
    RA[e] &&
      RA[e].scene.traverse(e => {
        e.isMesh && (e.material.side = THREE.FrontSide);
      });
  if (((RA.clipsBy = {}), RA.anims))
    for (const e of ['gas', 'sol2'])
      RA[e] && (RA.clipsBy[e] = retargetClips(RA.anims.scene, RA.anims.animations, RA[e].scene));
  RA.lensdirt && (POST.final.uniforms.tDirt.value = RA.lensdirt);
}
function retargetClips(e, t, o, n = 30) {
  const a = new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), Math.PI),
    r = e => {
      const t = new Map();
      return (
        e.traverse(e => {
          /mixamorig/.test(e.name) && t.set(e.name.replace(/^mixamorig:?/, ''), e);
        }),
        t
      );
    },
    s = r(e),
    l = r(o),
    i = [...l.keys()].filter(e => s.has(e)),
    c = e => {
      let t = 0;
      for (; e.parent;) ((e = e.parent), t++);
      return t;
    };
  (i.sort((e, t) => c(l.get(e)) - c(l.get(t))), e.updateMatrixWorld(!0), o.updateMatrixWorld(!0));
  const d = e => e.getWorldQuaternion(new THREE.Quaternion()),
    u = e => e.getWorldPosition(V3()),
    p = (e, t) => e.children.find(e => /mixamorig/.test(e.name) && t.has(e.name.replace(/^mixamorig:?/, ''))),
    m = new Map(),
    h = new Map(),
    f = new Map();
  for (const e of i) {
    const t = s.get(e),
      o = l.get(e);
    (m.set(e, a.clone().multiply(d(t))), h.set(e, d(o)));
    let n = new THREE.Quaternion();
    const r = /(Shoulder|Arm|ForeArm|UpLeg|Leg|Foot)$/.test(e) ? p(o, l) : null,
      i = r && s.get(r.name.replace(/^mixamorig:?/, ''));
    if (i && r && i.parent === t) {
      const e = u(i).sub(u(t)).applyQuaternion(a).normalize(),
        s = u(r).sub(u(o)).normalize();
      e.lengthSq() > 0.5 && s.lengthSq() > 0.5 && (n = new THREE.Quaternion().setFromUnitVectors(s, e));
    }
    f.set(e, n);
  }
  const g = new Map();
  for (const [e, t] of s) g.set(t, t.quaternion.clone());
  const v = {},
    T = new THREE.AnimationMixer(e);
  for (const o of t) {
    const t = T.clipAction(o);
    t.play();
    const r = Math.max(2, Math.ceil(o.duration * n) + 1),
      c = new Float32Array(r),
      u = new Map(i.map(e => [e, new Float32Array(4 * r)])),
      p = new Map();
    for (let g = 0; g < r; g++) {
      const r = Math.min(o.duration, g / n);
      ((c[g] = r), (t.time = r), T.update(0), e.updateMatrixWorld(!0), p.clear());
      for (const e of i) {
        const t = a
          .clone()
          .multiply(d(s.get(e)))
          .multiply(m.get(e).clone().invert())
          .multiply(f.get(e))
          .multiply(h.get(e));
        p.set(e, t);
        const o = l.get(e),
          n = o.parent && o.parent.name.replace(/^mixamorig:?/, ''),
          r = (p.has(n) ? p.get(n) : d(o.parent)).clone().invert().multiply(t);
        u.get(e).set([r.x, r.y, r.z, r.w], 4 * g);
      }
    }
    (t.stop(), T.uncacheClip(o));
    for (const [e, t] of g) e.quaternion.copy(t);
    v[o.name] = new THREE.AnimationClip(
      o.name,
      o.duration,
      i.map(e => new THREE.QuaternionKeyframeTrack(l.get(e).name + '.quaternion', c, u.get(e)))
    );
  }
  return (e.updateMatrixWorld(!0), v);
}
function photoMats() {
  const e = (e, t) => (e ? new THREE.MeshStandardMaterial(Object.assign({ map: e, roughness: 1 }, t)) : null);
  if (RA.brick_d) {
    const t = e(RA.brick_d, { bumpMap: RA.brick_b, bumpScale: 0.035, roughnessMap: RA.brick_r });
    ((t.userData = { tile: 1.6, surf: 'concrete' }), (MATS.brick = noTile(t, 'macro')));
  }
  if (RA.wood_d) {
    const t = e(RA.wood_d, { bumpMap: RA.wood_b, bumpScale: 0.006, roughnessMap: RA.wood_r });
    ((t.userData = { tile: 2.2, surf: 'wood' }), (MATS.wood = noTile(t, 'macro')));
  }
  if (RA.checker_d) {
    const t = e(RA.checker_d, { normalMap: RA.checker_n, roughness: 0.38 });
    (t.normalScale.set(0.6, 0.6),
      t.color.setRGB(0.82, 0.8, 0.74),
      (t.userData = { tile: 2.4, surf: 'tile', ntMac: 0.16 }),
      (MATS.lino = noTile(t, 1 / 3)));
  }
}
const _v1 = V3(),
  _v2 = V3(),
  _v3 = V3(),
  _q1 = new THREE.Quaternion(),
  _q2 = new THREE.Quaternion(),
  _q3 = new THREE.Quaternion();
function aimBone(e, t) {
  e.updateWorldMatrix(!0, !1);
  const o = e.getWorldPosition(_v1);
  e.getWorldQuaternion(_q1);
  const n = _v2.set(0, 1, 0).applyQuaternion(_q1).normalize(),
    a = _v3.subVectors(t, o).normalize();
  (_q2.setFromUnitVectors(n, a).multiply(_q1),
    e.parent.getWorldQuaternion(_q3),
    e.quaternion.copy(_q3.invert().multiply(_q2)),
    e.updateWorldMatrix(!1, !1));
}
function rotBoneWorld(e, t, o) {
  (e.updateWorldMatrix(!0, !1),
    e.getWorldQuaternion(_q1),
    _q2.setFromAxisAngle(t, o).multiply(_q1),
    e.parent.getWorldQuaternion(_q3),
    e.quaternion.copy(_q3.invert().multiply(_q2)),
    e.updateWorldMatrix(!1, !1));
}
function ik2(e, t, o, n, a) {
  const r = e.getWorldPosition(V3()),
    s = t.getWorldPosition(V3()),
    l = o.getWorldPosition(V3()),
    i = r.distanceTo(s),
    c = s.distanceTo(l),
    d = V3().subVectors(n, r),
    u = clamp(d.length(), 0.05, i + c - 0.002),
    p = d.normalize(),
    m = clamp((i * i + u * u - c * c) / (2 * i * u), -1, 1),
    h = Math.sqrt(1 - m * m),
    f = V3().subVectors(a, r);
  (f.addScaledVector(p, -f.dot(p)).normalize(),
    aimBone(
      e,
      V3()
        .copy(r)
        .addScaledVector(p, i * m)
        .addScaledVector(f, i * h)
    ),
    aimBone(t, V3().copy(r).addScaledVector(p, u)));
}
const SUIT_PAL = {
  school: [461069, 1057354, 1784442, 791600, 2774442, 1250844, 1716070],
  forest: [5912600, 3890204, 7227938, 2771478, 5205542, 3810832, 6713388],
  desert: [12884574, 9066024, 12096090, 10512950, 12553808, 7226914, 10254922]
};
function suitColor() {
  const e = SUIT_PAL[LV.mapKey] || SUIT_PAL.school,
    t = new THREE.Color(e[(Math.random() * e.length) | 0]),
    o = {};
  return (
    t.getHSL(o),
    t.setHSL(o.h + rand(-0.03, 0.03), clamp(o.s * rand(0.85, 1.3), 0, 1), clamp(o.l * rand(0.65, 1.3), 0, 0.5)),
    t.convertSRGBToLinear()
  );
}
const HOLD = {
  rifle: { butt: [0, -0.01, -0.34], grip: [0.012, -0.055, -0.115], guard: [-0.025, -0.06, 0.26] },
  dmr: { butt: [0, -0.01, -0.34], grip: [0.012, -0.055, -0.115], guard: [-0.012, -0.065, 0.32] },
  smg: { butt: [0, -0.01, -0.28], grip: [0.012, -0.055, -0.11], guard: [-0.012, -0.06, 0.22] },
  shotgun: { butt: [0, -0.05, -0.35], grip: [0.012, -0.06, -0.15], guard: [-0.012, -0.065, 0.3] },
  sniper: { butt: [0, -0.02, -0.46], grip: [0.012, -0.06, -0.18], guard: [-0.012, -0.07, 0.3] },
  pistol: { butt: null, grip: [0.012, -0.05, -0.1], guard: [-0.03, -0.065, -0.09] },
  knife: { butt: null, grip: [0, -0.02, -0.08], guard: null }
};
function setHold(e, t, o) {
  const n = HOLD[o] || HOLD.rifle;
  (e.position.set(...n.grip), n.guard && t.position.set(...n.guard), (e.userData.w = o));
}
const _m1 = new THREE.Matrix4(),
  _m2 = new THREE.Matrix4();
function poseHand(e, t, o, n, a, r) {
  if (!e || !t) return;
  const s = o.clone().normalize(),
    l = n.clone().addScaledVector(s, -n.dot(s)).normalize(),
    i = V3().crossVectors(l, s);
  (_m1.makeBasis(t.f, t.t, t.n), _m2.makeBasis(s, i, l));
  const c = new THREE.Quaternion().setFromRotationMatrix(_m2.multiply(_m1.transpose()));
  (e.parent.getWorldQuaternion(_q3), e.quaternion.copy(_q3.invert().multiply(c)), e.updateWorldMatrix(!1, !1));
  const d = Math.sign(V3().crossVectors(i, s).dot(l)) || 1;
  for (const e of t.fingers) for (const t of e) rotBoneWorld(t, i.clone().applyQuaternion(_q1.identity()), d * a);
  if (r) for (const e of t.thumb) rotBoneWorld(e, s, d * r * 0.5);
}
function makeHuman(e) {
  const t = new THREE.Group(),
    o = (e.pool || ['gas', 'sol2']).filter(e => RA[e]),
    n = o.length ? o[(Math.random() * o.length) | 0] : null,
    a = n && RA[n];
  e.model = n;
  const r = THREE.SkeletonUtils.clone(a.scene);
  ((r.rotation.y = 0), t.add(r));
  const s = [],
    l = (new THREE.Color(e.tint || 16777215), suitColor()),
    i = suitColor();
  r.traverse(t => {
    if (t.isMesh) {
      ((t.castShadow = !0), (t.receiveShadow = !0), (t.frustumCulled = !1));
      const o = t.material.clone();
      if ('sol2' !== e.model || !/head/i.test(t.material.name || '')) {
        const e = { uTint: { value: l }, uTint2: { value: i }, uAmt: { value: 0.9 } };
        ((o.onBeforeCompile = t => {
          (Object.assign(t.uniforms, e),
            (t.fragmentShader =
              'uniform vec3 uTint;uniform vec3 uTint2;uniform float uAmt;\n' +
              t.fragmentShader.replace(
                '#include <map_fragment>',
                '#include <map_fragment>\n      float tl=dot(diffuseColor.rgb,vec3(.299,.587,.114));vec3 tcol=mix(uTint,uTint2,step(.5,fract(vUv.x*3.)) );diffuseColor.rgb=mix(diffuseColor.rgb,tcol*(tl*3.4+.16),uAmt);'
              )));
        }),
          (o.customProgramCacheKey = () => 'tint'));
      }
      ((o.emissive = new THREE.Color(16777215)),
        (o.emissiveIntensity = 0),
        (o.envMapIntensity = 0.9),
        (o.side = THREE.FrontSide),
        (o.shadowSide = THREE.FrontSide),
        (t.material = o),
        s.push(o),
        HEAT.push(o));
    }
  });
  const c = e => r.getObjectByName('mixamorig' + e) || r.getObjectByName('mixamorig:' + e),
    d = {
      hips: c('Hips'),
      spine: c('Spine'),
      spine1: c('Spine1'),
      spine2: c('Spine2'),
      neck: c('Neck'),
      head: c('Head'),
      lSh: c('LeftShoulder'),
      rSh: c('RightShoulder'),
      lArm: c('LeftArm'),
      lFore: c('LeftForeArm'),
      lHand: c('LeftHand'),
      rArm: c('RightArm'),
      rFore: c('RightForeArm'),
      rHand: c('RightHand'),
      lUp: c('LeftUpLeg'),
      lLeg: c('LeftLeg'),
      lFoot: c('LeftFoot'),
      rUp: c('RightUpLeg'),
      rLeg: c('RightLeg'),
      rFoot: c('RightFoot')
    },
    u = e => {
      const t = c(e + 'Hand'),
        o = c(e + 'HandMiddle1'),
        n = c(e + 'HandIndex1'),
        a = c(e + 'HandPinky1');
      if ((c(e + 'HandThumb1'), !(t && o && n && a))) return null;
      r.updateMatrixWorld(!0);
      const s = o.position.clone().normalize(),
        l = V3(0, -1, 0).applyQuaternion(t.getWorldQuaternion(new THREE.Quaternion()).invert());
      return (
        l.addScaledVector(s, -l.dot(s)).normalize(),
        {
          f: s,
          t: V3().crossVectors(l, s),
          n: l,
          fingers: ['Index', 'Middle', 'Ring', 'Pinky'].map(t =>
            [1, 2, 3].map(o => c(e + 'Hand' + t + o)).filter(Boolean)
          ),
          thumb: [1, 2, 3].map(t => c(e + 'HandThumb' + t)).filter(Boolean)
        }
      );
    },
    p = { R: u('Right'), L: u('Left') },
    m = {};
  for (const e of ['hips', 'spine', 'spine1', 'spine2', 'neck', 'head', 'lUp', 'rUp', 'lLeg', 'rLeg', 'lFoot', 'rFoot'])
    d[e] && (m[e] = d[e].quaternion.clone());
  const h = new THREE.AnimationMixer(r),
    f = {};
  for (const e of Object.values((RA.clipsBy && RA.clipsBy[n]) || {}))
    ((f[e.name] = h.clipAction(e)), f[e.name].play(), f[e.name].setEffectiveWeight(0));
  f.Idle && f.Idle.setEffectiveWeight(1);
  const g = new THREE.Group();
  t.add(g);
  const v = worldGun(e.w || 'rifle');
  ((v.rotation.y = Math.PI), g.add(v));
  const T = new THREE.Object3D();
  (T.position.set(0, 0, 0.72), g.add(T));
  const b = new THREE.Object3D();
  g.add(b);
  const y = new THREE.Object3D();
  return (
    g.add(y),
    setHold(b, y, e.w || 'rifle'),
    {
      root: t,
      sc: r,
      bones: d,
      mixer: h,
      A: f,
      gun: g,
      muzzle: T,
      gripT: b,
      guardT: y,
      mats: s,
      dead: 0,
      phase: 0,
      w: { idle: 1, walk: 0, run: 0 },
      rest: m,
      hands: p,
      allBones: (() => {
        const e = [];
        return (r.traverse(t => t.isBone && e.push(t)), e);
      })(),
      base: null,
      soldier: !0
    }
  );
}
const _right = V3(),
  _fw = V3(),
  _up = V3(0, 1, 0),
  _lodV = V3(),
  _frustum = new THREE.Frustum(),
  _pv = new THREE.Matrix4();
let _frustumFrame = -1;
function animLOD(e, t, o, n, a, r) {
  if (!e.root.visible) return;
  if (r > 0 && e.rag && e.rag.still > 1.5) return;
  _frustumFrame !== G.t &&
    ((_frustumFrame = G.t),
    _frustum.setFromProjectionMatrix(_pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)));
  const s = e.root.position.distanceTo(camera.position),
    l = _frustum.containsPoint(_lodV.copy(e.root.position).setY(e.root.position.y + 1)),
    i = l ? (s > 45 ? 3 : s > 22 ? 2 : 1) : 4;
  ((e.lodAcc = (e.lodAcc || 0) + t),
    (e.lodN = ((e.lodN || 0) + 1) % i),
    (0 !== e.lodN && r <= 0) ||
      ((e.fine = l && s < 18), animHuman(e, Math.min(e.lodAcc, 0.12), o, n, a, r), (e.lodAcc = 0)));
}
const RAG_J = [
    'hips',
    'spine2',
    'head',
    'lArm',
    'rArm',
    'lUp',
    'rUp',
    'lFore',
    'lHand',
    'rFore',
    'rHand',
    'lLeg',
    'lFoot',
    'rLeg',
    'rFoot'
  ],
  RAG_TORSO = ['hips', 'spine2', 'head', 'lArm', 'rArm', 'lUp', 'rUp'],
  RAG_LIMB = [
    ['lArm', 'lFore'],
    ['lFore', 'lHand'],
    ['rArm', 'rFore'],
    ['rFore', 'rHand'],
    ['lUp', 'lLeg'],
    ['lLeg', 'lFoot'],
    ['rUp', 'rLeg'],
    ['rLeg', 'rFoot']
  ],
  RAG_R = {
    hips: 0.13,
    spine2: 0.14,
    head: 0.12,
    lArm: 0.08,
    rArm: 0.08,
    lUp: 0.09,
    rUp: 0.09,
    lFore: 0.05,
    rFore: 0.05,
    lHand: 0.04,
    rHand: 0.04,
    lLeg: 0.06,
    rLeg: 0.06,
    lFoot: 0.05,
    rFoot: 0.05
  },
  _rv = V3();
function torsoBasis(e) {
  const t = V3().subVectors(e.spine2, e.hips).normalize(),
    o = V3().subVectors(e.lUp, e.rUp).add(V3().subVectors(e.lArm, e.rArm)).normalize();
  return (o.addScaledVector(t, -o.dot(t)).normalize(), new THREE.Matrix4().makeBasis(o, t, V3().crossVectors(o, t)));
}
function startRagdoll(e) {
  const t = e.bones;
  e.root.updateMatrixWorld(!0);
  const o = {},
    n = {};
  for (const e of RAG_J) ((o[e] = t[e].getWorldPosition(V3())), (n[e] = o[e].clone()));
  const a = V3(e.vx || 0, 0, e.vz || 0);
  let r = e.hitFrom ? V3().subVectors(o.spine2, e.hitFrom).setY(0) : _fw.clone().multiplyScalar(-1);
  (r.lengthSq() < 1e-4 && (r = _fw.clone().multiplyScalar(-1)),
    r.normalize().multiplyScalar(1.6 + 1.4 * (e.hitAmt || 0.6)));
  const s = 1 / 60;
  for (const t of RAG_J) {
    const l = (o[t].y - e.root.position.y) / 1.7,
      i = a
        .clone()
        .addScaledVector(r, l * l)
        .add(V3(rand(-0.3, 0.3), 0, rand(-0.3, 0.3)));
    (('lLeg' !== t && 'rLeg' !== t) || i.addScaledVector(_fw, 0.6), n[t].addScaledVector(i, -s));
  }
  const l = [];
  for (let e = 0; e < RAG_TORSO.length; e++)
    for (let t = e + 1; t < RAG_TORSO.length; t++) {
      const n = RAG_TORSO[e],
        a = RAG_TORSO[t];
      l.push([n, a, o[n].distanceTo(o[a])]);
    }
  for (const [e, t] of RAG_LIMB) l.push([e, t, o[e].distanceTo(o[t])]);
  for (const [e, t] of [
    ['lHand', 'spine2'],
    ['rHand', 'spine2'],
    ['lFoot', 'hips'],
    ['rFoot', 'hips']
  ])
    l.push([e, t, 0.55 * o[e].distanceTo(o[t]), !0]);
  const i = torsoBasis(o),
    c = t.hips.getWorldQuaternion(new THREE.Quaternion()),
    d = t.spine2.getWorldQuaternion(new THREE.Quaternion()),
    u = new THREE.Quaternion().setFromRotationMatrix(i).invert();
  ((e.rag = { P: o, O: n, C: l, qH0: c, qC0: d, qB0inv: u, acc: 0, still: 0, t: 0 }),
    null == e.hipsPos0 && (e.hipsPos0 = t.hips.position.clone()));
}
function stepRagdoll(e, t) {
  const o = e.rag,
    n = o.P,
    a = o.O,
    r = 1 / 60;
  if (((o.t += t), o.still > 1.5)) return !1;
  o.acc = Math.min(o.acc + t, 0.1);
  let s = 0;
  for (; o.acc >= r;) {
    o.acc -= r;
    for (const e of RAG_J) {
      const t = n[e],
        o = a[e],
        l = 0.995 * (t.x - o.x),
        i = 0.995 * (t.y - o.y),
        c = 0.995 * (t.z - o.z);
      (o.copy(t),
        (t.x += l),
        (t.y += i - 9.8 * r * r),
        (t.z += c),
        (s = Math.max(s, Math.abs(l) + Math.abs(i) + Math.abs(c))));
    }
    for (let e = 0; e < 6; e++) {
      for (const [e, t, a, r] of o.C) {
        const o = n[e],
          s = n[t];
        _rv.subVectors(s, o);
        const l = _rv.length() || 1e-6;
        if (r && l >= a) continue;
        const i = ((l - a) / l) * 0.5;
        (o.addScaledVector(_rv, i), s.addScaledVector(_rv, -i));
      }
      if (!(1 & e))
        for (const e of RAG_J) {
          const t = n[e],
            o = RAG_R[e],
            r = groundAt(t.x, t.z, t.y + 0.4, 0.02);
          if (t.y < r + o) {
            t.y = r + o;
            const n = a[e];
            ((n.x = lerp(n.x, t.x, 0.35)), (n.z = lerp(n.z, t.z, 0.35)));
          }
          (_rv.set(t.x, t.y - 0.05, t.z), collide(_rv, o, 0.1), (t.x = _rv.x), (t.z = _rv.z));
        }
    }
  }
  return ((o.still = s < 0.0015 ? o.still + t : 0), !0);
}
function poseRagdoll(e) {
  const t = e.bones,
    o = e.rag.P,
    n = e.rag,
    a = new THREE.Quaternion().setFromRotationMatrix(torsoBasis(o)).multiply(n.qB0inv),
    r = (e, t) => {
      (e.parent.getWorldQuaternion(_q3), e.quaternion.copy(_q3.invert().multiply(t)), e.updateWorldMatrix(!1, !1));
    };
  (t.hips.parent.updateWorldMatrix(!0, !1),
    t.hips.position.copy(t.hips.parent.worldToLocal(o.hips.clone())),
    r(t.hips, a.clone().multiply(n.qH0)),
    aimBone(t.spine, o.spine2),
    r(t.spine2, a.clone().multiply(n.qC0)),
    aimBone(t.neck, o.head));
  for (const [e, n] of [
    ['lArm', 'lFore'],
    ['lFore', 'lHand'],
    ['rArm', 'rFore'],
    ['rFore', 'rHand'],
    ['lUp', 'lLeg'],
    ['lLeg', 'lFoot'],
    ['rUp', 'rLeg'],
    ['rLeg', 'rFoot']
  ])
    aimBone(t[e], o[n]);
}
function sampleClips(e, t) {
  const o = e.allBones;
  if (e.base) for (let t = 0; t < o.length; t++) o[t].quaternion.copy(e.base[t]);
  if ((e.mixer.update(t), e.base)) for (let t = 0; t < o.length; t++) e.base[t].copy(o[t].quaternion);
  else e.base = o.map(e => e.quaternion.clone());
}
function animHuman(e, t, o, n, a, r) {
  r > 0 ? (null == e.deadYaw && (e.deadYaw = e.root.rotation.y), (e.root.rotation.y = e.deadYaw)) : (e.deadYaw = null);
  const s = e.bones,
    l = e.root.rotation.y;
  if ((_right.set(Math.cos(l), 0, -Math.sin(l)), _fw.set(Math.sin(l), 0, Math.cos(l)), r > 0))
    return (
      e.rag || ((e.sc.rotation.x = 0), startRagdoll(e)),
      (e.dead = Math.min(1, e.dead + 3 * t)),
      (e.gun.visible = !1),
      void (stepRagdoll(e, t) && poseRagdoll(e))
    );
  (e.rag && ((e.rag = null), e.hipsPos0 && e.bones.hips.position.copy(e.hipsPos0)),
    (e.dead = 0),
    (e.sc.rotation.x = 0),
    (e.sc.position.y = 0),
    (e.sc.position.z = 0),
    (e.sc.position.x = 0),
    (e.gun.visible = !0));
  const i = e.alert ?? 1;
  e.t = (e.t || 0) + t;
  const c = e.root.position;
  if ((e.lp || ((e.lp = c.clone()), (e.lyaw = l)), t > 0)) {
    const o = Math.min(1, 4 * t);
    ((e.vx = lerp(e.vx || 0, (c.x - e.lp.x) / t, o)),
      (e.vz = lerp(e.vz || 0, (c.z - e.lp.z) / t, o)),
      (e.turn = lerp(e.turn || 0, angDiff(e.lyaw, l) / t, Math.min(1, 10 * t))));
  }
  (e.lp.copy(c), (e.lyaw = l));
  const d = Math.hypot(e.vx, e.vz);
  let u = 0,
    p = !1;
  if (d > 0.35 && o > 0.3) {
    const t = (e.vx * _fw.x + e.vz * _fw.z) / d,
      o = (e.vx * _right.x + e.vz * _right.z) / d,
      n = Math.atan2(o, t);
    (Math.abs(n) > 1.9 ? ((p = !0), (u = n - Math.sign(n) * Math.PI)) : (u = n),
      (u = Math.sign(u) * Math.max(0, Math.abs(u) - 0.3)),
      (u = clamp(u, -0.6, 0.6)));
  }
  ((e.leg = lerp(e.leg || 0, u, Math.min(1, 3 * t))), (e.back = approach(e.back || 0, p ? 1 : 0, 6 * t)));
  const m = o < 0.4 && Math.abs(e.turn) > 1.2,
    h = { idle: o < 0.4 && !m ? 1 : 0, walk: (o >= 0.4 && o < 3.4) || m ? 1 : 0, run: o >= 3.4 ? 1 : 0 };
  for (const o in e.w) e.w[o] = approach(e.w[o], h[o], 5 * t);
  const f = e.back > 0.5 ? -1 : 1;
  if (
    (e.A.Idle && (e.A.Idle.setEffectiveWeight(e.w.idle), (e.A.Idle.timeScale = 0.8)),
    e.A.Walk &&
      (e.A.Walk.setEffectiveWeight(e.w.walk), (e.A.Walk.timeScale = (m ? 0.7 : clamp(o / 1.45, 0.55, 1.5)) * f)),
    e.A.Run && (e.A.Run.setEffectiveWeight(e.w.run), (e.A.Run.timeScale = clamp(o / 4.8, 0.75, 1.25) * f)),
    sampleClips(e, t),
    e.rawClip)
  )
    return;
  e.rest.hips && s.hips.quaternion.slerp(e.rest.hips, 0.65);
  const g = 0.15 - 0.08 * i;
  for (const t of ['spine', 'spine1', 'spine2', 'neck', 'head']) e.rest[t] && s[t].quaternion.slerp(e.rest[t], 1 - g);
  const v = e.w.run > e.w.walk ? e.A.Run : e.A.Walk,
    T = v ? (v.time / v.getClip().duration) * TAU : 0,
    b = Math.max(e.w.walk, e.w.run) * (m ? 0.3 : 1),
    y = e.w.run,
    x = Math.sin(T),
    M = Math.sin(2 * T);
  (rotBoneWorld(s.hips, _up, x * (0.07 + 0.05 * y) * b),
    rotBoneWorld(s.spine1, _up, -x * (0.06 + 0.05 * y) * b),
    rotBoneWorld(s.spine2, _up, 0.03 * -x * b),
    s.lSh &&
      s.rSh &&
      (rotBoneWorld(s.lSh, _fw, x * (0.03 + 0.04 * y) * b), rotBoneWorld(s.rSh, _fw, x * (0.03 + 0.04 * y) * b)),
    (e.bob = -Math.abs(x) * (0.018 + 0.03 * y) * b));
  const w = e.w.idle,
    E = Math.sin(0.55 * e.t + (e.seed || 0));
  (rotBoneWorld(s.hips, _fw, 0.025 * E * w),
    rotBoneWorld(s.spine1, _fw, 0.03 * -E * w),
    Math.abs(e.leg) > 0.01 &&
      (rotBoneWorld(s.hips, _up, e.leg),
      rotBoneWorld(s.spine, _up, 0.45 * -e.leg),
      rotBoneWorld(s.spine1, _up, 0.3 * -e.leg),
      rotBoneWorld(s.spine2, _up, 0.25 * -e.leg)));
  const S = Math.max(e.w.walk, e.w.run),
    G = 0.12 + 0.1 * i + 0.04 * S;
  (rotBoneWorld(s.lUp, _right, 0.9 * -G),
    rotBoneWorld(s.rUp, _right, 0.7 * -G),
    rotBoneWorld(s.lLeg, _right, 1.5 * G),
    rotBoneWorld(s.rLeg, _right, 1.3 * G),
    (e.sc.position.y = -0.03 - 0.035 * i - 0.02 * S + (e.bob || 0)),
    (e.sc.position.x = 0.012 * E * w),
    (e.breath = approach(e.breath || 0, e.w.run, t * (e.w.run > 0.5 ? 1 : 0.15))));
  const P = Math.sin(e.t * (1.6 + 2.2 * e.breath)) * (0.012 + 0.025 * e.breath);
  (rotBoneWorld(s.spine, _right, 0.16 + 0.1 * i + (p ? 0 : 0.18 * e.w.run) + P),
    rotBoneWorld(s.spine1, _right, 0.08 + 0.04 * i),
    rotBoneWorld(s.neck, _right, 0.12),
    s.lSh && s.rSh && (rotBoneWorld(s.lSh, _up, -0.1 - 0.05 * i), rotBoneWorld(s.rSh, _up, 0.1 + 0.05 * i)),
    rotBoneWorld(s.spine2, _right, 0.6 * -P),
    n > 0.01 &&
      ((e.sc.position.y += 0.27 * -n),
      rotBoneWorld(s.lUp, _right, 0.75 * -n),
      rotBoneWorld(s.rUp, _right, 0.6 * -n),
      rotBoneWorld(s.lLeg, _right, 1.3 * n),
      rotBoneWorld(s.rLeg, _right, 1.15 * n),
      rotBoneWorld(s.spine, _right, 0.12 * n)));
  const A =
    (1 - 0.85 * i) *
    (0.45 * Math.sin(0.45 * e.t + (e.seed || (e.seed = 9 * Math.random()))) + 0.08 * Math.sin(1.3 * e.t));
  e.scan = approach(e.scan || 0, A, 1.5 * t);
  let R = 0;
  if (e.hitT > 0) {
    e.hitT -= t;
    const o = 1 - e.hitT / 0.32;
    R = Math.sin(Math.min(1, 2.2 * o) * Math.PI) * (1 - 0.4 * o) * (e.hitAmt || 0.6);
  }
  (rotBoneWorld(s.spine1, _right, 0.3 * -a - 0.35 * R),
    rotBoneWorld(s.spine2, _up, 0.15 * R),
    rotBoneWorld(s.neck, _right, 0.35 * -a),
    rotBoneWorld(s.neck, _up, 0.6 * e.scan),
    rotBoneWorld(s.head, _up, 0.4 * e.scan));
  {
    const e = s.head.getWorldQuaternion(new THREE.Quaternion()),
      t = V3(0, 0, 1).applyQuaternion(e),
      o = Math.asin(clamp(t.y, -1, 1));
    rotBoneWorld(s.head, _right, 0.85 * -(a - o) - 0.5 * R + 0.025 * M * b);
  }
  const k = HOLD[e.gripT.userData.w] || HOLD.rifle,
    V = s.rArm.getWorldPosition(V3()),
    z = s.lArm.getWorldPosition(V3()),
    L = V.distanceTo(z),
    O = clamp(Math.max(0.42 * (1 - i), 0.6 * e.w.run), 0, 0.65) * (1 - 0.4 * n);
  e.ready = approach(e.ready ?? O, O, 4 * t);
  const B = 0.015 * (1 - 0.7 * i),
    H = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        -a + e.ready + Math.sin(1.1 * e.t) * B + 0.25 * R + M * (0.012 + 0.02 * (1 - i)) * b,
        0.08 + Math.sin(0.7 * e.t) * B - x * (0.015 + 0.025 * (1 - i)) * b,
        0.03 * x * b,
        'YXZ'
      )
    );
  if (k.butt) {
    const t = V.clone()
        .addScaledVector(_right, 0.18 * -L)
        .addScaledVector(_fw, 0.06)
        .add(V3(0, -0.035, 0)),
      o = V3(...k.butt).applyQuaternion(H);
    e.gun.position.copy(e.root.worldToLocal(t)).sub(o);
  } else {
    const t = s.spine2
      .getWorldPosition(V3())
      .addScaledVector(_fw, 0.42 - 0.25 * e.ready)
      .add(V3(0, 0.12 - 0.25 * e.ready, 0));
    e.gun.position.copy(e.root.worldToLocal(t));
  }
  (e.gun.quaternion.copy(H), e.gun.updateMatrixWorld(!0));
  const C = e.gun.getWorldQuaternion(new THREE.Quaternion()),
    D = V3(0, 0, 1).applyQuaternion(C),
    N = V3(0, 1, 0).applyQuaternion(C),
    U = V3(-1, 0, 0).applyQuaternion(C),
    I = e.gripT.getWorldPosition(V3()),
    W = e.guardT.getWorldPosition(V3());
  (ik2(
    s.rArm,
    s.rFore,
    s.rHand,
    I,
    I.clone()
      .addScaledVector(U, 0.25)
      .addScaledVector(D, -0.2)
      .add(V3(0, -0.5, 0))
  ),
    k.guard &&
      ik2(
        s.lArm,
        s.lFore,
        s.lHand,
        W,
        W.clone()
          .addScaledVector(U, -0.25)
          .addScaledVector(D, -0.1)
          .add(V3(0, -0.6, 0))
      ),
    !1 !== e.fine &&
      poseHand(s.rHand, e.hands.R, D.clone().multiplyScalar(0.75).addScaledVector(N, -0.6), U.clone().negate(), 1, 0.5),
    k.guard &&
      !1 !== e.fine &&
      poseHand(
        s.lHand,
        e.hands.L,
        k.butt
          ? U.clone().multiplyScalar(0.9).addScaledVector(D, 0.45)
          : D.clone().multiplyScalar(0.7).addScaledVector(N, -0.6),
        k.butt ? N.clone() : U.clone(),
        k.butt ? 0.85 : 1,
        0.3
      ));
}
const ZONE_MUL = { h: 1, n: 1.6, c: 1, s: 0.9, a: 0.6, l: 0.65 };
function boneZones(e) {
  const t = e.bones,
    o = e => e.getWorldPosition(V3()),
    n = (e, t) => o(e).add(o(t)).multiplyScalar(0.5);
  return [
    [o(t.head).add(V3(0, 0.09, 0)), 0.13, 'h'],
    [o(t.neck), 0.085, 'n'],
    [o(t.spine2), 0.2, 'c'],
    [o(t.spine1), 0.19, 'c'],
    [o(t.spine), 0.18, 's'],
    [o(t.hips), 0.17, 's'],
    [n(t.lArm, t.lFore), 0.075, 'a'],
    [n(t.rArm, t.rFore), 0.075, 'a'],
    [n(t.lFore, t.lHand), 0.065, 'a'],
    [n(t.rFore, t.rHand), 0.065, 'a'],
    [n(t.lUp, t.lLeg), 0.11, 'l'],
    [n(t.rUp, t.rLeg), 0.11, 'l'],
    [n(t.lLeg, t.lFoot), 0.085, 'l'],
    [n(t.rLeg, t.rFoot), 0.085, 'l']
  ];
}
