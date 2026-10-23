/* Cielo y lluvia */
function skyMaterial(e) {
  const t = e => new THREE.Color(e).convertSRGBToLinear();
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: !1,
    fog: !1,
    uniforms: {
      top: { value: t(e.top) },
      hor: { value: t(e.hor) },
      bot: { value: t(e.bot) },
      sunDir: { value: e.sun.clone().normalize() },
      sunCol: { value: t(e.sunCol) },
      sunSize: { value: e.sunSize || 900 },
      glow: { value: e.glow || 0.5 },
      clouds: { value: e.clouds || 0 },
      stars: { value: e.stars || 0 },
      cloudCol: { value: t(e.cloudCol || 8947848) },
      time: GT
    },
    vertexShader:
      'varying vec3 vDir;void main(){vDir=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
    fragmentShader:
      'uniform vec3 top,hor,bot,sunDir,sunCol,cloudCol;uniform float sunSize,glow,clouds,stars,time;varying vec3 vDir;\n    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}\n    float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<6;i++){s+=a*n(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}\n    void main(){vec3 d=normalize(vDir);float y=d.y;\n      float sd=max(dot(d,sunDir),0.);vec2 sh=normalize(sunDir.xz+1e-4);float az=max(dot(normalize(d.xz+1e-4),sh),0.);\n      vec3 hz=hor*(1.+glow*.22*pow(az,3.)*(1.-sunDir.y));\n      vec3 c=y>0.?mix(hz,top,pow(clamp(y,0.,1.),.5)):mix(hz,bot,pow(clamp(-y,0.,1.),.3));\n      c+=hz*.35*exp(-abs(y)*14.);\n      c+=sunCol*(smoothstep(1.-1.6/sunSize,1.-.9/sunSize,sd)*30.+pow(sd,8.)*glow*.55+pow(sd,2.)*glow*.12);\n      if(stars>0.&&y>0.){vec3 q=floor(d*380.);float s=h(q.xy+q.z*7.1);float tw=.55+.45*sin(time*2.3+s*311.);c+=vec3(.85,.9,1.)*step(.9982,s)*stars*tw*smoothstep(.02,.35,y)*(1.-clouds*.6);\n        c+=sunCol*pow(sd,60.)*.25*stars;}\n      if(clouds>0.&&y>0.){vec2 p=d.xz/(y+.08)*.9;vec2 w=vec2(fbm(p*.6+time*.004),fbm(p*.6+7.3));p+=w*1.4+vec2(time*.012,time*.004);\n        float base=fbm(p);float cov=mix(.68,.42,clouds);float cl=smoothstep(cov,cov+.28,base);\n        float lit=clamp((base-fbm(p+sh*.25))*5.+.5,0.,1.);\n        vec3 cc=mix(cloudCol*.45,cloudCol*1.15,lit)+sunCol*pow(sd,5.)*glow*.5*(1.-cl*.5);\n        cc=mix(cc,hz,smoothstep(.25,0.,y)*.7);\n        c=mix(c,cc,cl*smoothstep(0.,.12,y)*min(1.,clouds*1.6));}\n      c+=(h(gl_FragCoord.xy)-.5)/255.;\n      gl_FragColor=vec4(max(c,0.),1.);}'
  });
}
function buildSky(e) {
  const t = new THREE.Mesh(new THREE.SphereGeometry(800, 48, 24), skyMaterial(e));
  ((t.frustumCulled = !1), (t.renderOrder = -1));
  const o = 256,
    n = 128,
    a = document.createElement('canvas');
  ((a.width = o), (a.height = n));
  const r = a.getContext('2d'),
    s = r.createImageData(o, n),
    l = t => new THREE.Color(t).convertSRGBToLinear().multiplyScalar(e.mul || 1),
    i = l(e.top),
    c = l(e.hor),
    d = l(e.bot),
    u = new THREE.Color(e.sunCol).convertSRGBToLinear(),
    p = e.sun.clone().normalize(),
    m = e => Math.round(255 * Math.pow(clamp(e, 0, 1), 1 / 2.2));
  for (let t = 0; t < n; t++) {
    const a = ((t + 0.5) / n) * Math.PI,
      r = Math.cos(a),
      l = Math.sin(a);
    for (let n = 0; n < o; n++) {
      const a = ((n + 0.5) / o) * TAU,
        h = -Math.cos(a) * l,
        f = -Math.sin(a) * l;
      let g, v, T;
      if (r > 0) {
        const e = Math.pow(r, 0.55);
        ((g = lerp(c.r, i.r, e)), (v = lerp(c.g, i.g, e)), (T = lerp(c.b, i.b, e)));
      } else {
        const e = Math.pow(-r, 0.35);
        ((g = lerp(c.r, d.r, e)), (v = lerp(c.g, d.g, e)), (T = lerp(c.b, d.b, e)));
      }
      const b = Math.max(0, h * p.x + r * p.y + f * p.z),
        y = Math.pow(b, 8) * (e.glow || 0.5) * 0.6 + Math.pow(b, 2) * (e.glow || 0.5) * 0.15 + 3 * Math.pow(b, 200),
        x = 4 * (t * o + n);
      ((s.data[x] = m(g + u.r * y)),
        (s.data[x + 1] = m(v + u.g * y)),
        (s.data[x + 2] = m(T + u.b * y)),
        (s.data[x + 3] = 255));
    }
  }
  r.putImageData(s, 0, 0);
  const h = new THREE.CanvasTexture(a);
  ((h.mapping = THREE.EquirectangularReflectionMapping), (h.encoding = THREE.sRGBEncoding));
  const f = new THREE.PMREMGenerator(renderer),
    g = f.fromEquirectangular(h).texture;
  return (f.dispose(), h.dispose(), { mesh: t, env: g });
}
const WET_MATS = [
    'asphalt',
    'concrete',
    'ground',
    'sand',
    'rock',
    'brick',
    'adobe',
    'adobe2',
    'planks',
    'logs',
    'bark',
    'rust',
    'corr',
    'needles'
  ],
  RAIN = { mesh: null, pos: null, vel: null, n: 2600, roof: 0, flashT: 0, nextBolt: 12 };
function setWetMaterials(e) {
  for (const t of Object.keys(MATS)) {
    const o = MATS[t];
    (o.userData.dry && ((o.roughness = o.userData.dry.r), o.color.copy(o.userData.dry.c)),
      e &&
        (WET_MATS.includes(t) || /^carpaint/.test(t)) &&
        (o.userData.dry || (o.userData.dry = { r: o.roughness, c: o.color.clone() }),
        (o.roughness = 0.38 * o.userData.dry.r),
        o.color.copy(o.userData.dry.c).multiplyScalar(0.72)));
  }
}
function applyRainLook() {
  const e = LV.skyCfg,
    t = (e, t, o) => {
      const n = new THREE.Color(e),
        a = 0.3 * n.r + 0.59 * n.g + 0.11 * n.b;
      return n
        .lerp(new THREE.Color(a, a, a), t)
        .multiplyScalar(o)
        .getHex();
    };
  ((LV.skyCfg = Object.assign({}, e, {
    top: t(e.top, 0.75, 0.55),
    hor: t(e.hor, 0.7, 0.7),
    bot: t(e.bot, 0.6, 0.7),
    clouds: 1,
    cloudCol: t(e.cloudCol || 8947848, 0.8, 0.55),
    glow: 0.35 * (e.glow || 0.5),
    sunSize: 3e4,
    stars: 0
  })),
    (LV.sun.intensity *= 0.3),
    LV.hemi && (LV.hemi.intensity *= 0.85),
    LV.fog.color.lerp(new THREE.Color(7172727), 0.5).multiplyScalar(0.8),
    (LV.fog.density = Math.max(1.7 * LV.fog.density, 0.02)),
    (LV.post.sat *= 0.82),
    (LV.post.haze = 0),
    (LV.post.exp *= 1.08));
}
function buildRain() {
  const e = RAIN.n,
    t = new Float32Array(6 * e);
  RAIN.vel = new Float32Array(e);
  for (let o = 0; o < e; o++) {
    const e = rand(-16, 16),
      n = rand(-2, 16),
      a = rand(-16, 16);
    (t.set([e, n, a, e, n - 0.5, a], 6 * o), (RAIN.vel[o] = rand(11, 15)));
  }
  const o = new THREE.BufferGeometry();
  o.setAttribute('position', new THREE.BufferAttribute(t, 3));
  const n = new THREE.LineBasicMaterial({ color: 9082014, transparent: !0, opacity: 0.22, depthWrite: !1, fog: !0 });
  ((RAIN.mesh = new THREE.LineSegments(o, n)), (RAIN.mesh.frustumCulled = !1), (RAIN.pos = t), LV.group.add(RAIN.mesh));
}
function tickRain(e, t) {
  if (!RAIN.mesh) return;
  const o = camera.position,
    n = RAIN.pos;
  for (let e = 0; e < RAIN.n; e++) {
    const a = 6 * e,
      r = RAIN.vel[e] * t;
    ((n[a + 1] -= r),
      (n[a] += 1.6 * t),
      (n[a + 1] < o.y - 3 || Math.abs(n[a] - o.x) > 16 || Math.abs(n[a + 2] - o.z) > 16) &&
        ((n[a] = o.x + rand(-16, 16)), (n[a + 1] = o.y + rand(8, 16)), (n[a + 2] = o.z + rand(-16, 16))),
      (n[a + 3] = n[a] - 1.6 * 0.035),
      (n[a + 4] = n[a + 1] + 0.42),
      (n[a + 5] = n[a + 2]));
  }
  if (((RAIN.mesh.geometry.attributes.position.needsUpdate = !0), (RAIN.chk = (RAIN.chk || 0) - t), RAIN.chk <= 0)) {
    RAIN.chk = 0.2;
    const e = rayWorld(o, V3(0, 1, 0), 30, !1);
    RAIN.under = !!e;
  }
  if (
    ((RAIN.roof = approach(RAIN.roof, RAIN.under ? 1 : 0, 3 * t)),
    (RAIN.mesh.material.opacity = 0.22 * (1 - 0.85 * RAIN.roof)),
    AU.rainG && (AU.rainG.gain.value = 0.11 * (1 - 0.55 * RAIN.roof)),
    (RAIN.nextBolt -= t),
    RAIN.nextBolt <= 0)
  ) {
    ((RAIN.nextBolt = rand(18, 45)), (RAIN.flashT = 0.35));
    const e = rand(0.6, 2.5);
    setTimeout(() => sndThunder(), 1e3 * e);
  }
  if (LV.hemi) {
    null == RAIN.base && (RAIN.base = LV.hemi.intensity);
    let e = 0;
    (RAIN.flashT > 0 &&
      ((RAIN.flashT -= t), (e = RAIN.flashT > 0.22 || (RAIN.flashT < 0.12 && RAIN.flashT > 0.05) ? 1 : 0)),
      (LV.hemi.intensity = RAIN.base + 2.5 * e * (1 - 0.6 * RAIN.roof)));
  }
}
function setupWeather() {
  ((RAIN.mesh = null),
    (RAIN.base = null),
    (RAIN.roof = 0),
    (RAIN.nextBolt = rand(10, 25)),
    setWetMaterials(G.rain),
    G.rain && (buildRain(), LV.tick.push(tickRain)));
}
