/* Lista de mapas, hora del día y carga de mapa */
const TODS = {
    dawn: {
      name: 'Amanecer',
      clock: [6, 52, 0],
      sun: [0.9, 0.18, 0.4],
      sunC: 16757370,
      sunI: 1.5,
      hemiS: 10465750,
      hemiG: 3813162,
      hemiI: 0.45,
      fog: 12101274,
      exp: 1.05,
      envK: 0.6,
      bloom: 1.1,
      flash: !1,
      sky: {
        top: 4153231,
        hor: 15774858,
        bot: 4866104,
        sunCol: 16760970,
        sunSize: 900,
        glow: 1.1,
        stars: 0.15,
        clouds: 0.45,
        cloudCol: 14263690,
        mul: 1
      }
    },
    day: {
      name: 'Día',
      clock: [13, 20, 0],
      sun: [0.35, 1, 0.25],
      sunC: 16774112,
      sunI: 2.6,
      hemiS: 12375280,
      hemiG: 5918790,
      hemiI: 0.7,
      fog: 12766678,
      exp: 1,
      envK: 0.9,
      bloom: 0.8,
      flash: !1,
      sky: {
        top: 3108277,
        hor: 12375788,
        bot: 6971992,
        sunCol: 16774880,
        sunSize: 1600,
        glow: 0.6,
        stars: 0,
        clouds: 0.5,
        cloudCol: 16777215,
        mul: 1
      }
    },
    dusk: {
      name: 'Tarde',
      clock: [19, 34, 0],
      sun: [-0.9, 0.16, -0.35],
      sunC: 16751196,
      sunI: 1.4,
      hemiS: 9080768,
      hemiG: 3811876,
      hemiI: 0.4,
      fog: 10125176,
      exp: 1.1,
      envK: 0.5,
      bloom: 1.2,
      flash: !1,
      sky: {
        top: 2897254,
        hor: 15764058,
        bot: 3812908,
        sunCol: 16752736,
        sunSize: 800,
        glow: 1.2,
        stars: 0.3,
        clouds: 0.5,
        cloudCol: 13140074,
        mul: 1
      }
    },
    night: {
      name: 'Noche',
      clock: [23, 47, 0],
      sun: [-0.4, 0.6, 0.55],
      sunC: 10466528,
      sunI: 0.55,
      hemiS: 3820138,
      hemiG: 657932,
      hemiI: 0.06,
      fog: 395794,
      exp: 1.7,
      envK: 0.12,
      bloom: 1.4,
      flash: !0,
      sky: {
        top: 264470,
        hor: 1911621,
        bot: 131587,
        sunCol: 10137820,
        sunSize: 2600,
        glow: 0.45,
        stars: 1.8,
        clouds: 0.3,
        cloudCol: 1712947,
        mul: 1
      }
    }
  },
  MAPTINT = {
    school: { fog: 6119784, k: 0.15 },
    forest: { fog: 6255206, k: 0.35, ground: 2762264 },
    desert: { fog: 14207403, k: 0.55, ground: 11768432 }
  },
  MAPS = {
    school: {
      name: 'Instituto San Telmo',
      meta: '23:47 · noche',
      desc: 'Escuela abandonada. Pasillos con taquillas, aulas, comedor y gimnasio. Fluorescentes que parpadean.',
      build: buildSchool,
      tod: 'night'
    },
    forest: {
      name: 'Pinar de Montseny',
      meta: '19:12 · niebla',
      desc: 'Bosque de pinos con cabañas de troncos, torre de vigilancia y una hoguera encendida.',
      build: buildForest,
      tod: 'dusk'
    },
    desert: {
      name: 'Al-Qasr',
      meta: '13:40 · sol duro',
      desc: 'Pueblo de adobe con azoteas accesibles, mercado en la plaza, sacos terreros y calima.',
      build: buildDesert,
      tod: 'day'
    }
  };
function todOf(e) {
  const t = G.tod;
  return TODS[t] && 'auto' !== t ? t : MAPS[e].tod;
}
function todMeta(e) {
  if (!TODS[G.tod] || 'auto' === G.tod || G.tod === MAPS[e].tod) return MAPS[e].meta;
  const t = TODS[G.tod];
  return String(t.clock[0]).padStart(2, '0') + ':' + String(t.clock[1]).padStart(2, '0') + ' · ' + t.name.toLowerCase();
}
function applyTOD(e) {
  const t = G.tod;
  if (!TODS[t] || 'auto' === t || t === MAPS[e].tod) return;
  const o = TODS[t],
    n = MAPTINT[e] || {},
    a = LV.sun,
    r = 'night' === t;
  (a.color.set(o.sunC),
    (a.intensity = o.sunI),
    a.position
      .set(...o.sun)
      .normalize()
      .multiplyScalar(100),
    LV.hemi &&
      (LV.hemi.color.set(o.hemiS),
      LV.hemi.groundColor.set(r || !n.ground ? o.hemiG : n.ground),
      (LV.hemi.intensity = o.hemiI * (r ? 1 : LV.indoor || 1))),
    (LV.skyCfg = Object.assign({}, o.sky, { sun: V3(...o.sun) })));
  const s = new THREE.Color(o.fog);
  (n.fog && !r && s.lerp(new THREE.Color(n.fog), n.k),
    LV.fog.color.copy(s),
    r && 'school' !== e && (LV.fog.density = Math.max(LV.fog.density, 0.022)),
    Object.assign(LV.post, {
      exp: o.exp,
      envK: o.envK,
      bloomThr: o.bloom,
      flash: o.flash,
      haze: 'desert' === e && 'day' === t ? 1 : 0
    }),
    'forest' !== e || r || (LV.post.exp *= 1.1),
    (LV.clock = o.clock.slice()));
}
function loadMap(e) {
  (resetLevel(),
    (RNG = Noise(977 * e.length + 13).rnd),
    MAPS[e].build(),
    (RNG = Math.random),
    applyTOD(e),
    G.rain && applyRainLook());
  const t = LV.skyCfg,
    o = buildSky(t);
  if (t.mul) for (const e of ['top', 'hor', 'bot']) o.mesh.material.uniforms[e].value.multiplyScalar(t.mul);
  ((LV.sky = o.mesh),
    scene.add(o.mesh),
    (scene.environment = o.env),
    LV.fog.color.convertSRGBToLinear(),
    (scene.fog = LV.fog));
  for (const t of Object.keys(MATS)) MATS[t].envMapIntensity = 'night' === todOf(e) ? 0.35 : 0.8;
  const n = LV.sun;
  ((n.castShadow = !0), n.shadow.mapSize.set(Q.shadow, Q.shadow));
  const a = LV.post.shadowR;
  (Object.assign(n.shadow.camera, { left: -a, right: a, top: a, bottom: -a, near: 1, far: 260 }),
    n.shadow.camera.updateProjectionMatrix(),
    (n.shadow.bias = -4e-4),
    (n.shadow.normalBias = 0.03),
    (LV.sunOff = n.position.clone().normalize().multiplyScalar(120)),
    finalizeLevel(),
    setupWeather(),
    buildNav());
  const r = POST.final.uniforms;
  ((r.uHaze.value = LV.post.haze),
    (r.uSat.value = LV.post.sat),
    r.uGrade.value.set(...LV.post.grade),
    (POST.bright.uniforms.thr.value = LV.post.bloomThr),
    (LV.mapKey = e),
    (LV.todKey = G.tod),
    (LV.rainKey = G.rain));
}
