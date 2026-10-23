/* Modelos de armas y miras */
function scaleUV(e, t) {
  const o = e.attributes.uv;
  if (!o) return e;
  for (let e = 0; e < o.count; e++) o.setXY(e, o.getX(e) * t, o.getY(e) * t);
  return e;
}
function ext(e, t, o = 0.002, n = null, a = 6) {
  const r = new THREE.Shape(e.map(e => V2(e[0], e[1])));
  if (n) for (const e of n) r.holes.push(new THREE.Path(e.map(e => V2(e[0], e[1]))));
  const s = Math.max(5e-4, t - 2 * o),
    l = new THREE.ExtrudeGeometry(r, {
      depth: s,
      bevelEnabled: o > 0,
      bevelThickness: o,
      bevelSize: o,
      bevelSegments: 3,
      curveSegments: a
    });
  return (l.translate(0, 0, -s / 2), scaleUV(l, 3.5));
}
function side(e, t, o = 0.002, n = 0, a = null) {
  const r = ext(e, t, o, a);
  return (r.rotateY(Math.PI / 2), r.translate(n, 0, 0), r);
}
function front(e, t, o, n = 0.0015, a = null) {
  const r = ext(e, o - t, n, a);
  return (r.translate(0, 0, -(t + o) / 2), r);
}
function tube(e, t, o, n = 28, a = 0, r = 0, s) {
  const l = new THREE.CylinderGeometry(void 0 === s ? e : s, e, o - t, n, 1);
  return (l.rotateX(-Math.PI / 2), l.translate(r, a, -(t + o) / 2), scaleUV(l, 2));
}
function lathe(e, t, o = 0, n = 36) {
  const a = new THREE.LatheGeometry(
    e.map(e => V2(e[1], e[0])),
    n
  );
  return (a.rotateX(-Math.PI / 2), a.translate(0, o, -t), scaleUV(a, 2));
}
function bx(e, t, o, n, a, r, s = 0) {
  const l = new THREE.BoxGeometry(e, t, o);
  return (s && l.rotateX(s), l.translate(n, a, -r), scaleUV(l, 3));
}
function oct(e, t = 0.42) {
  const o = e * t;
  return [
    [-o, e],
    [o, e],
    [e, o],
    [e, -o],
    [o, -e],
    [-o, -e],
    [-e, -o],
    [-e, o]
  ];
}
function railTeeth(e, t, o, n, a = 0.021) {
  e.push(bx(0.75 * a, 0.004, o - t, 0, n + 0.002, (t + o) / 2));
  for (let r = t + 0.004; r < o - 0.004; r += 0.01) e.push(bx(a, 0.0035, 0.0052, 0, n + 0.0058, r));
}
function mergeTo(e, t, o) {
  if (!t.length) return null;
  const n = new THREE.Mesh(mergeGeos(t.map(e => (e.index, e))), o);
  return (e.add(n), n);
}
let MAT_GUN = null;
function gunMats() {
  if (MAT_GUN) return MAT_GUN;
  const e = genPBR('gunmetal'),
    t = genPBR('polymer'),
    o = stdMat(e, {});
  ((o.metalness = 0.45), (o.envMapIntensity = 0.7));
  const n = stdMat(t, {});
  n.envMapIntensity = 0.8;
  const a = stdMat(genPBR('fabric'), { color: 9074262 });
  a.envMapIntensity = 0.7;
  const r = new THREE.MeshStandardMaterial({ color: 328965, roughness: 0.9 }),
    s = new THREE.MeshStandardMaterial({ color: 1052688, roughness: 0.95, normalMap: t.normalMap }),
    l = new THREE.MeshStandardMaterial({ color: 1054752, roughness: 0.04, metalness: 0.9, envMapIntensity: 2.5 }),
    i = new THREE.MeshStandardMaterial({
      color: 10467532,
      transparent: !0,
      opacity: 0.14,
      roughness: 0.02,
      metalness: 0.3,
      envMapIntensity: 2,
      depthWrite: !1
    }),
    c = new THREE.MeshStandardMaterial({ color: 11766590, metalness: 1, roughness: 0.32 });
  return (MAT_GUN = { metal: o, poly: n, fde: a, black: r, rubber: s, lens: l, glass: i, brass: c });
}
function holoSight(e, t, o) {
  const n = front(
    [
      [-0.024, 0],
      [0.024, 0],
      [0.024, 0.032],
      [0.017, 0.044],
      [-0.017, 0.044],
      [-0.024, 0.032]
    ],
    o,
    o + 0.072,
    0.0018,
    [
      [
        [-0.0185, 0.009],
        [0.0185, 0.009],
        [0.0185, 0.034],
        [-0.0185, 0.034]
      ]
    ]
  );
  return (
    n.translate(0, t, 0),
    e.metal.push(n),
    e.metal.push(bx(0.03, 0.012, 0.06, 0, t - 0.004, o + 0.036)),
    e.metal.push(tube(0.0045, o + 0.03, o + 0.05, 12, t + 0.04, 0.026)),
    e.poly.push(bx(0.008, 0.014, 0.02, 0.027, t + 0.012, o + 0.06)),
    t + 0.0215
  );
}
function addReticle(e, t, o) {
  const n = gunMats(),
    a = new THREE.Mesh(new THREE.PlaneGeometry(0.036, 0.024), n.glass.clone());
  ((a.material.depthWrite = !0), a.position.set(0, t, -o), e.add(a));
  const r = new THREE.MeshBasicMaterial({ color: 16722452, fog: !1 });
  ((r.toneMapped = !1), r.color.multiplyScalar(7));
  const s = new THREE.Mesh(new THREE.CircleGeometry(8e-4, 20), r);
  return (s.position.set(0, t, -o - 5e-4), e.add(s), s);
}
function scope(e, t, o, n, a, r) {
  const s = [
    [0, 1.55 * a],
    [0.01, 1.6 * a],
    [0.045, 1.45 * a],
    [0.07, a],
    [n - 0.075, a],
    [n - 0.06, a * (r || 1.6) * 0.9],
    [n - 0.01, a * (r || 1.6)],
    [n, a * (r || 1.6) * 0.97]
  ];
  (e.metal.push(lathe(s, o, t)),
    e.lens.push(tube(a * (r || 1.6) * 0.9, o + n - 0.004, o + n - 0.002, 28, t)),
    e.lens.push(tube(1.4 * a, o + 0.002, o + 0.004, 28, t)));
  const l = o + 0.45 * n;
  e.metal.push(tube(0.62 * a, l - 0.012, l + 0.012, 18, t + a + 0.012).rotateZ(0));
  const i = new THREE.CylinderGeometry(0.6 * a, 0.6 * a, 0.024, 18);
  (i.translate(0, t + a + 0.012, -l), e.metal.push(scaleUV(i, 2)));
  const c = new THREE.CylinderGeometry(0.6 * a, 0.6 * a, 0.024, 18);
  (c.rotateZ(Math.PI / 2), c.translate(a + 0.012, t, -l), e.metal.push(scaleUV(c, 2)));
  for (const r of [o + 0.28 * n, o + 0.66 * n])
    (e.metal.push(front(oct(a + 0.004, 0.6), r - 0.008, r + 0.008, 0.001).translate(0, t, 0)),
      e.metal.push(bx(0.024, t - a - 0.03, 0.018, 0, (t - a) / 2 + 0.012, r)));
}
function buildGunCore(e) {
  const t = new THREE.Group(),
    o = gunMats(),
    n = { metal: [], poly: [], fde: [], black: [], rubber: [], lens: [], brass: [] };
  let a = 0.058,
    r = -0.7,
    s = null,
    l = null,
    i = null;
  const c = [];
  if ('rifle' === e || 'dmr' === e || 'smg' === e) {
    const t = 'dmr' === e;
    if ('smg' === e) {
      (n.metal.push(
        side(
          [
            [-0.07, -0.022],
            [0.2, -0.022],
            [0.2, 0.026],
            [0.18, 0.034],
            [-0.07, 0.034]
          ],
          0.044,
          0.0025
        )
      ),
        n.metal.push(
          side(
            [
              [-0.07, -0.022],
              [0.14, -0.022],
              [0.14, -0.04],
              [-0.05, -0.04]
            ],
            0.042,
            0.002
          )
        ),
        n.poly.push(
          side(
            [
              [-0.03, -0.036],
              [0.004, -0.036],
              [-0.02, -0.145],
              [-0.058, -0.15],
              [-0.062, -0.136],
              [-0.046, -0.05]
            ],
            0.032,
            0.0055
          )
        ),
        n.metal.push(
          side(
            [
              [0, -0.04],
              [0.044, -0.04],
              [0.044, -0.068],
              [0, -0.068]
            ],
            0.012,
            0.0015,
            0,
            [
              [
                [0.005, -0.045],
                [0.039, -0.045],
                [0.039, -0.063],
                [0.005, -0.063]
              ]
            ]
          )
        ),
        n.metal.push(
          side(
            [
              [0.014, -0.042],
              [0.021, -0.042],
              [0.019, -0.056],
              [0.013, -0.062],
              [0.009, -0.06],
              [0.015, -0.054]
            ],
            0.006,
            8e-4
          )
        ),
        c.push(
          side(
            [
              [0.058, -0.03],
              [0.088, -0.03],
              [0.094, -0.2],
              [0.064, -0.2]
            ],
            0.024,
            0.002
          )
        ),
        c.push(bx(0.028, 0.008, 0.036, 0, -0.204, 0.079)),
        n.poly.push(front(oct(0.026, 0.5), 0.2, 0.33, 0.002)));
      for (let e = 0.22; e < 0.31; e += 0.035)
        for (const t of [-1, 1]) n.black.push(bx(0.002, 0.006, 0.022, 0.0262 * t, 0, e));
      (n.metal.push(tube(0.009, 0.31, 0.37, 22)),
        n.metal.push(tube(0.0115, 0.37, 0.41, 22)),
        (r = -0.415),
        railTeeth(n.metal, -0.06, 0.33, 0.034));
      for (const e of [-1, 1]) n.metal.push(bx(0.006, 0.006, 0.2, 0.018 * e, -0.005, -0.17));
      (n.metal.push(bx(0.042, 0.07, 0.012, 0, -0.035, -0.27)),
        n.rubber.push(bx(0.046, 0.075, 0.01, 0, -0.035, -0.281)),
        (a = holoSight(n, 0.04, 0.02)),
        (l = null));
    } else {
      (n.metal.push(
        side(
          [
            [-0.09, -0.012],
            [0.17, -0.012],
            [0.17, 0.022],
            [0.155, 0.03],
            [-0.09, 0.03]
          ],
          0.046,
          0.0022
        )
      ),
        n.metal.push(bx(0.004, 0.022, 0.07, 0.0245, 0.006, 0.06)),
        n.metal.push(tube(0.008, -0.04, -0.01, 16, 0.012, 0.02)),
        n.metal.push(bx(0.03, 0.007, 0.05, 0, 0.033, -0.07)),
        n.metal.push(bx(0.05, 0.008, 0.012, 0, 0.033, -0.09)),
        n.metal.push(
          side(
            [
              [-0.085, -0.012],
              [0.14, -0.012],
              [0.14, -0.03],
              [0.12, -0.046],
              [-0.02, -0.046],
              [-0.06, -0.034],
              [-0.085, -0.024]
            ],
            0.044,
            0.002
          )
        ),
        n.metal.push(
          side(
            [
              [0.044, -0.04],
              [0.122, -0.04],
              [0.124, -0.088],
              [0.04, -0.088]
            ],
            0.05,
            0.0025,
            0,
            [
              [
                [0.05, -0.08],
                [0.115, -0.08],
                [0.116, -0.087],
                [0.049, -0.087]
              ]
            ]
          )
        ),
        (t ? n.poly : n.fde).push(
          side(
            [
              [-0.032, -0.038],
              [0.002, -0.04],
              [-0.022, -0.152],
              [-0.064, -0.158],
              [-0.07, -0.142],
              [-0.052, -0.06]
            ],
            0.032,
            0.0055
          )
        ),
        n.metal.push(
          side(
            [
              [-0.002, -0.044],
              [0.046, -0.044],
              [0.046, -0.073],
              [-0.002, -0.073]
            ],
            0.012,
            0.0015,
            0,
            [
              [
                [0.004, -0.049],
                [0.04, -0.049],
                [0.04, -0.067],
                [0.004, -0.067]
              ]
            ]
          )
        ),
        n.metal.push(
          side(
            [
              [0.014, -0.046],
              [0.021, -0.046],
              [0.019, -0.06],
              [0.013, -0.067],
              [0.009, -0.065],
              [0.015, -0.058]
            ],
            0.006,
            8e-4
          )
        ),
        n.metal.push(tube(0.0045, 0.012, 0.02, 10, -0.02, -0.024).rotateY(0)));
      const e = t ? 0.46 : 0.36;
      (t ? n.poly : n.fde).push(front(oct(0.03, 0.45), 0.17, 0.17 + e, 0.002));
      for (let t = 0.2; t < 0.17 + e - 0.03; t += 0.045) {
        for (const e of [-1, 1]) n.black.push(bx(0.002, 0.007, 0.03, 0.0302 * e, -0.002, t));
        n.black.push(bx(0.007, 0.002, 0.03, 0, -0.0302, t));
      }
      railTeeth(n.metal, -0.085, 0.17 + e, 0.03);
      const o = t ? 0.22 : 0.15,
        s = 0.17 + e - 0.02;
      (n.metal.push(tube(t ? 0.0105 : 0.0095, s, s + o, 24, 0, 0, t ? 0.0095 : 0.0088)),
        n.metal.push(tube(0.0125, s + o, s + o + 0.062, 24)));
      for (let e = 0; e < 3; e++) n.black.push(bx(0.026, 0.004, 0.007, 0, 0, s + o + 0.012 + 0.015 * e));
      if (
        ((r = -(s + o + 0.064)),
        n.metal.push(tube(0.0155, -0.09, -0.25, 24, 0.004)),
        (t ? n.poly : n.fde).push(
          side(
            [
              [-0.14, 0.026],
              [-0.325, 0.026],
              [-0.336, 0.004],
              [-0.333, -0.07],
              [-0.296, -0.08],
              [-0.19, -0.014],
              [-0.14, -0.012]
            ],
            0.046,
            0.005
          )
        ),
        n.rubber.push(
          side(
            [
              [-0.333, 0.026],
              [-0.346, 0.026],
              [-0.348, -0.078],
              [-0.335, -0.08]
            ],
            0.05,
            0.003
          )
        ),
        t)
      ) {
        const e = [
          [0.05, -0.08],
          [0.12, -0.08],
          [0.124, -0.17],
          [0.054, -0.17]
        ];
        c.push(side(e, 0.028, 0.003));
        for (let e = 0; e < 4; e++) c.push(bx(0.03, 0.003, 0.06, 0, -0.1 - 0.02 * e, 0.087));
      } else {
        c.push(
          side(
            [
              [0.05, -0.08],
              [0.118, -0.08],
              [0.13, -0.198],
              [0.074, -0.214],
              [0.06, -0.14]
            ],
            0.026,
            0.0025
          )
        );
        for (let e = 0; e < 5; e++) c.push(bx(0.029, 0.002, 0.05, 0, -0.1 - 0.022 * e, 0.088 + 0.004 * e));
        c.push(
          side(
            [
              [0.07, -0.205],
              [0.135, -0.192],
              [0.137, -0.204],
              [0.075, -0.218]
            ],
            0.03,
            0.002
          )
        );
      }
      (t ? (scope(n, 0.07, -0.03, 0.27, 0.0155, 1.65), (a = 0.07)) : (a = holoSight(n, 0.036, 0)),
        n.metal.push(bx(0.024, 0.012, 0.016, 0, 0.04, 0.17 + e - 0.04)),
        n.metal.push(bx(0.024, 0.012, 0.016, 0, 0.04, -0.075)));
    }
  } else if ('sniper' === e) {
    (n.poly.push(
      side(
        [
          [-0.43, 0.03],
          [-0.2, 0.03],
          [-0.12, -0.005],
          [0, -0.005],
          [0, -0.016],
          [0.42, -0.016],
          [0.42, -0.05],
          [0.1, -0.05],
          [0.06, -0.06],
          [-0.02, -0.06],
          [-0.06, -0.17],
          [-0.1, -0.175],
          [-0.1, -0.09],
          [-0.2, -0.09],
          [-0.43, -0.13]
        ],
        0.052,
        0.006
      )
    ),
      n.rubber.push(
        side(
          [
            [-0.43, 0.03],
            [-0.447, 0.03],
            [-0.447, -0.13],
            [-0.43, -0.13]
          ],
          0.055,
          0.004
        )
      ),
      n.poly.push(
        side(
          [
            [-0.33, 0.03],
            [-0.2, 0.03],
            [-0.2, 0.045],
            [-0.31, 0.045]
          ],
          0.03,
          0.004
        )
      ),
      n.metal.push(tube(0.019, -0.1, 0.16, 28, 0.008)),
      n.metal.push(bx(0.034, 0.01, 0.24, 0, 0.03, 0.03)),
      railTeeth(n.metal, -0.1, 0.16, 0.034, 0.022),
      n.metal.push(tube(0.0135, 0.16, 0.42, 24, 0.008, 0, 0.012)),
      n.metal.push(tube(0.0115, 0.42, 0.82, 24, 0.008, 0, 0.0105)));
    for (let e = 0; e < 6; e++) {
      const t = (e / 6) * TAU;
      n.black.push(bx(0.002, 0.002, 0.32, 0.0108 * Math.cos(t), 0.008 + 0.0108 * Math.sin(t), 0.6));
    }
    n.metal.push(tube(0.015, 0.82, 0.9, 24, 0.008));
    for (let e = 0; e < 3; e++)
      for (const t of [-1, 1]) n.black.push(bx(0.004, 0.006, 0.012, 0.0145 * t, 0.008, 0.835 + 0.02 * e));
    ((r = -0.905),
      c.push(
        side(
          [
            [0.03, -0.05],
            [0.1, -0.05],
            [0.1, -0.1],
            [0.03, -0.1]
          ],
          0.034,
          0.003
        )
      ),
      n.metal.push(
        side(
          [
            [0.035, -0.05],
            [0.08, -0.05],
            [0.08, -0.075],
            [0.035, -0.075]
          ],
          0.012,
          0.0015,
          0,
          [
            [
              [0.04, -0.055],
              [0.075, -0.055],
              [0.075, -0.07],
              [0.04, -0.07]
            ]
          ]
        ).translate(0, -0.012, 0)
      ),
      scope(n, 0.072, -0.12, 0.36, 0.0175, 1.85),
      (a = 0.072));
    const e = new THREE.Group();
    (e.position.set(0.02, 0.012, 0.06), tube(0.005, 0, 1e-4, 8));
    const s = new THREE.CylinderGeometry(0.0055, 0.0055, 0.06, 12);
    (s.rotateZ(Math.PI / 2), s.translate(0.03, 0, 0));
    const i = new THREE.SphereGeometry(0.013, 16, 12);
    i.translate(0.062, -0.004, 0);
    const d = new THREE.Mesh(mergeGeos([scaleUV(s, 2), scaleUV(i, 2)]), o.metal);
    (e.add(d), t.add(e), (l = e));
    for (const e of [-1, 1]) n.metal.push(bx(0.008, 0.008, 0.16, 0.012 * e, -0.062, -0.4));
  } else {
    (n.metal.push(
      side(
        [
          [-0.08, -0.03],
          [0.17, -0.03],
          [0.17, 0.02],
          [0.15, 0.028],
          [-0.06, 0.028],
          [-0.08, 0.015]
        ],
        0.05,
        0.003
      )
    ),
      n.metal.push(tube(0.0135, 0.17, 0.72, 26, 0.006)),
      n.metal.push(tube(0.0115, 0.17, 0.64, 24, -0.026)),
      n.metal.push(tube(0.012, 0.64, 0.655, 20, -0.026)));
    const e = [],
      s = 0.24,
      l = 0.17;
    e.push(
      front(
        [
          [-0.024, -0.04],
          [0.024, -0.04],
          [0.028, -0.026],
          [0.028, -0.008],
          [0.02, 0],
          [-0.02, 0],
          [-0.028, -0.008],
          [-0.028, -0.026]
        ],
        s,
        s + l,
        0.003
      )
    );
    for (let t = s + 0.012; t < s + l - 0.01; t += 0.014)
      for (const o of [-1, 1]) e.push(bx(0.003, 0.022, 0.005, 0.0292 * o, -0.019, t));
    ((i = new THREE.Mesh(mergeGeos(e), o.poly)),
      (i.userData.z0 = 0),
      t.add(i),
      n.poly.push(
        side(
          [
            [-0.04, -0.03],
            [-0.005, -0.03],
            [-0.03, -0.13],
            [-0.07, -0.135],
            [-0.075, -0.12],
            [-0.06, -0.04]
          ],
          0.034,
          0.006
        )
      ),
      n.poly.push(
        side(
          [
            [-0.075, 0.018],
            [-0.33, -0],
            [-0.34, -0.13],
            [-0.3, -0.135],
            [-0.12, -0.06],
            [-0.075, -0.03]
          ],
          0.044,
          0.006
        )
      ),
      n.rubber.push(
        side(
          [
            [-0.335, 0],
            [-0.352, 0],
            [-0.354, -0.135],
            [-0.338, -0.137]
          ],
          0.048,
          0.004
        )
      ),
      n.metal.push(
        side(
          [
            [0, -0.03],
            [0.05, -0.03],
            [0.05, -0.058],
            [0, -0.058]
          ],
          0.012,
          0.0015,
          0,
          [
            [
              [0.006, -0.035],
              [0.044, -0.035],
              [0.044, -0.052],
              [0.006, -0.052]
            ]
          ]
        )
      ),
      n.metal.push(
        side(
          [
            [0.018, -0.032],
            [0.025, -0.032],
            [0.023, -0.046],
            [0.016, -0.052],
            [0.012, -0.05],
            [0.018, -0.044]
          ],
          0.006,
          8e-4
        )
      ));
    for (let e = 0; e < 4; e++) n.brass.push(tube(0.0105, 0.03 * e - 0.02, 0.01 + 0.03 * e, 14, 0.012, 0.028));
    const c = new THREE.SphereGeometry(0.0035, 10, 8);
    (c.translate(0, 0.022, -0.71),
      n.metal.push(scaleUV(c, 1)),
      n.metal.push(bx(0.026, 0.008, 0.012, 0, 0.03, 0.13)),
      (a = 0.0255),
      (r = -0.725));
  }
  for (const e of Object.keys(n)) mergeTo(t, n[e], o[e]);
  (c.length && ((s = new THREE.Mesh(mergeGeos(c), 'smg' === e ? o.poly : o.metal)), t.add(s)),
    ('rifle' !== e && 'smg' !== e) || addReticle(t, a, 'smg' === e ? 0.075 : 0.055));
  const d = new THREE.Object3D();
  return (
    d.position.set(0, 'sniper' === e ? 0.008 : 'shotgun' === e ? 0.006 : 0, r),
    t.add(d),
    t.traverse(e => {
      e.isMesh && ((e.castShadow = !1), (e.receiveShadow = !0));
    }),
    { g: t, muzzle: d, mag: s, bolt: l, pump: i, sightY: a }
  );
}
function capsule(e, t, o = 14) {
  const n = [];
  for (let o = 0; o <= 6; o++) {
    const a = -Math.PI / 2 + ((o / 6) * Math.PI) / 2;
    n.push(V2(Math.cos(a) * e, Math.sin(a) * e - t));
  }
  for (let t = 0; t <= 6; t++) {
    const o = ((t / 6) * Math.PI) / 2;
    n.push(V2(Math.cos(o) * e, Math.sin(o) * e));
  }
  return scaleUV(
    new THREE.LatheGeometry(
      n.map(e => V2(Math.max(e.x, 1e-4), e.y)),
      o
    ),
    3
  );
}
const WORLDGUN = {};
function worldGun(e = 'rifle') {
  if (!WORLDGUN[e]) {
    const t = buildGun(e);
    WORLDGUN[e] = t.g;
  }
  const t = WORLDGUN[e].clone(!0);
  return (
    t.traverse(e => {
      e.isMesh && ((e.castShadow = !0), e.layers.set(0));
    }),
    t
  );
}
function buildGun(e) {
  if ('pistol' !== e && 'knife' !== e) return buildGunCore(e);
  const t = new THREE.Group(),
    o = gunMats(),
    n = { metal: [], poly: [], black: [] };
  let a,
    r,
    s = null;
  if ('pistol' === e) {
    n.metal.push(
      side(
        [
          [-0.09, -0.004],
          [0.1, -0.004],
          [0.1, 0.026],
          [0.094, 0.031],
          [-0.084, 0.031],
          [-0.09, 0.025]
        ],
        0.028,
        0.0022
      )
    );
    for (let e = 0; e < 7; e++) n.black.push(bx(0.0285, 0.018, 0.0025, 0, 0.012, 0.006 * e - 0.08));
    (n.poly.push(
      side(
        [
          [-0.072, -0.004],
          [0.098, -0.004],
          [0.098, -0.02],
          [0.035, -0.022],
          [-0.015, -0.028],
          [-0.072, -0.02]
        ],
        0.03,
        0.002
      )
    ),
      n.poly.push(
        side(
          [
            [-0.07, -0.018],
            [-0.018, -0.028],
            [-0.036, -0.122],
            [-0.078, -0.128],
            [-0.088, -0.11]
          ],
          0.032,
          0.005
        )
      ),
      n.metal.push(
        side(
          [
            [-0.006, -0.022],
            [0.036, -0.022],
            [0.036, -0.046],
            [-0.006, -0.046]
          ],
          0.01,
          0.0012,
          0,
          [
            [
              [0, -0.026],
              [0.03, -0.026],
              [0.03, -0.041],
              [0, -0.041]
            ]
          ]
        )
      ),
      n.metal.push(
        side(
          [
            [0.008, -0.024],
            [0.014, -0.024],
            [0.012, -0.036],
            [0.007, -0.041],
            [0.004, -0.039],
            [0.009, -0.034]
          ],
          0.005,
          6e-4
        )
      ),
      n.metal.push(tube(0.0062, 0.098, 0.103, 16, 0.012)),
      n.black.push(tube(0.0045, 0.1, 0.104, 12, 0.012)),
      n.metal.push(bx(0.005, 0.006, 0.006, 0, 0.034, 0.088)));
    for (const e of [-1, 1]) n.metal.push(bx(0.004, 0.006, 0.008, 0.0065 * e, 0.034, -0.075));
    ((s = new THREE.Mesh(mergeGeos([bx(0.03, 0.012, 0.046, 0, -0.13, -0.058)]), o.poly)),
      t.add(s),
      (a = -0.106),
      (r = 0.037));
  } else {
    (n.metal.push(
      side(
        [
          [0, 0],
          [0.15, 0.003],
          [0.19, 0.011],
          [0.165, 0.02],
          [0.12, 0.024],
          [0, 0.026]
        ],
        0.0045,
        9e-4
      )
    ),
      n.black.push(
        side(
          [
            [0, 0.004],
            [0.13, 0.006],
            [0.13, 0.009],
            [0, 0.009]
          ],
          0.0047,
          2e-4
        )
      ),
      n.poly.push(
        side(
          [
            [-0.115, -0.003],
            [-0.005, -0.003],
            [-0.005, 0.029],
            [-0.115, 0.027],
            [-0.12, 0.013]
          ],
          0.024,
          0.005
        )
      ));
    for (let e = 0; e < 6; e++) n.black.push(bx(0.0245, 0.034, 0.003, 0, 0.013, 0.016 * e - 0.1));
    (n.metal.push(bx(0.034, 0.05, 0.008, 0, 0.012, 0)),
      n.metal.push(bx(0.028, 0.034, 0.01, 0, 0.012, -0.12)),
      (a = -0.19),
      (r = 0));
  }
  for (const e of Object.keys(n)) mergeTo(t, n[e], o[e]);
  const l = new THREE.Object3D();
  return (
    l.position.set(0, 0.012, a),
    t.add(l),
    t.traverse(e => {
      e.isMesh && ((e.castShadow = !1), (e.receiveShadow = !0));
    }),
    { g: t, muzzle: l, mag: s, bolt: null, pump: null, sightY: r }
  );
}
