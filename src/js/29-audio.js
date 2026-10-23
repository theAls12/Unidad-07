/* Audio: disparos, pasos, ambiente y radio */
const AU = { ctx: null, amb: [], next: {} };
function noiseBuf(e, t) {
  const o = AU.ctx,
    n = Math.floor(o.sampleRate * e),
    a = o.createBuffer(1, n, o.sampleRate),
    r = a.getChannelData(0);
  let s = 0;
  for (let e = 0; e < n; e++) {
    const o = 2 * Math.random() - 1;
    'brown' === t ? ((s = (s + 0.02 * o) / 1.02), (r[e] = 3.5 * s)) : (r[e] = o);
  }
  return a;
}
function audioInit() {
  if (AU.ctx) return void ('running' !== AU.ctx.state && AU.ctx.resume());
  const e = new (window.AudioContext || window.webkitAudioContext)();
  ((AU.ctx = e), (AU.master = e.createGain()), (AU.master.gain.value = 0.9));
  const t = e.createDynamicsCompressor();
  ((t.threshold.value = -16),
    (t.knee.value = 10),
    (t.ratio.value = 6),
    (t.attack.value = 0.002),
    (t.release.value = 0.2),
    (AU.duck = e.createGain()),
    AU.master.connect(AU.duck),
    AU.duck.connect(t),
    t.connect(e.destination),
    (AU.sfx = e.createGain()),
    AU.sfx.connect(AU.master),
    (AU.ambG = e.createGain()),
    (AU.ambG.gain.value = 0.5),
    AU.ambG.connect(AU.master),
    (AU.rev = e.createConvolver()),
    (AU.revIn = e.createGain()),
    AU.revIn.connect(AU.rev),
    (AU.revOut = e.createGain()),
    (AU.revOut.gain.value = 0.6),
    AU.rev.connect(AU.revOut),
    AU.revOut.connect(AU.master),
    (AU.slap = e.createDelay(1)),
    (AU.slap.delayTime.value = 0.19),
    (AU.slapG = e.createGain()),
    (AU.slapG.gain.value = 0),
    AU.revIn.connect(AU.slap),
    AU.slap.connect(AU.slapG),
    AU.slapG.connect(AU.master),
    (AU.white = noiseBuf(3, 'white')),
    (AU.brown = noiseBuf(6, 'brown')),
    setReverb(LV.post ? LV.post.reverb : 'school'),
    startAmbience());
}
function setReverb(e) {
  if (!AU.ctx) return;
  const t = AU.ctx,
    o = { school: [2.6, 2.2, 0.02, 0], forest: [1.4, 3.5, 0.004, 0], desert: [0.8, 4, 0, 0.32] }[e] || [1.5, 3, 0, 0],
    n = Math.floor(t.sampleRate * o[0]),
    a = t.createBuffer(2, n, t.sampleRate);
  for (let r = 0; r < 2; r++) {
    const s = a.getChannelData(r);
    for (let e = 0; e < n; e++) {
      const t = e / n;
      s[e] = (2 * Math.random() - 1) * Math.pow(1 - t, o[1]) * (t < o[2] ? 0.2 : 1);
    }
    if ('school' === e) for (let e = 0; e < 14; e++) s[Math.floor(rand(0.004, 0.09) * t.sampleRate)] += rand(-0.9, 0.9);
  }
  ((AU.rev.buffer = a),
    (AU.slapG.gain.value = o[3]),
    (AU.revOut.gain.value = 'desert' === e ? 0.35 : 'forest' === e ? 0.45 : 0.7));
}
function env(e, t, o, n, a) {
  (e.gain.setValueAtTime(1e-4, t),
    e.gain.linearRampToValueAtTime(n, t + o),
    e.gain.exponentialRampToValueAtTime(1e-4, t + o + a));
}
function nsrc(e, t, o, n = 1) {
  const a = AU.ctx.createBufferSource();
  ((a.buffer = e), (a.playbackRate.value = n));
  const r = Math.random() * Math.max(0, e.duration - o - 0.1);
  return (a.start(t, r), a.stop(t + o + 0.05), a);
}
function filt(e, t, o = 0.7) {
  const n = AU.ctx.createBiquadFilter();
  return ((n.type = e), (n.frequency.value = t), (n.Q.value = o), n);
}
function setPos(e, t) {
  e.positionX
    ? ((e.positionX.value = t.x), (e.positionY.value = t.y), (e.positionZ.value = t.z))
    : e.setPosition(t.x, t.y, t.z);
}
function out(e, t = {}) {
  const o = AU.ctx,
    n = o.createGain();
  let a = n;
  const r = void 0 === t.rev ? 0.3 : t.rev;
  if (e) {
    const s = e.distanceTo(camera.position);
    if (!1 !== t.air) {
      const e = filt('lowpass', clamp(22e3 * Math.exp(-s / (t.airK || 70)), 700, 2e4));
      (a.connect(e), (a = e));
    }
    if (t.occl && !losClear(camera.position, e, !1)) {
      const e = filt('lowpass', 650);
      (a.connect(e), (a = e), (n.gain.value = 0.55));
    }
    const l = o.createPanner();
    ((l.panningModel = 'HRTF'),
      (l.distanceModel = 'inverse'),
      (l.refDistance = t.ref || 1.5),
      (l.rolloffFactor = t.roll || 1.2),
      (l.maxDistance = 5e3),
      setPos(l, e),
      a.connect(l),
      l.connect(AU.sfx));
    const i = o.createGain();
    ((i.gain.value = r * clamp(0.4 + s / 35, 0, 2.5)), l.connect(i), i.connect(AU.revIn));
  } else {
    a.connect(AU.sfx);
    const e = o.createGain();
    ((e.gain.value = r), a.connect(e), e.connect(AU.revIn));
  }
  return n;
}
function updateListener() {
  if (!AU.ctx) return;
  const e = AU.ctx.listener,
    t = camera.position,
    o = V3(0, 0, -1).applyQuaternion(camera.quaternion),
    n = V3(0, 1, 0).applyQuaternion(camera.quaternion);
  e.positionX
    ? ((e.positionX.value = t.x),
      (e.positionY.value = t.y),
      (e.positionZ.value = t.z),
      (e.forwardX.value = o.x),
      (e.forwardY.value = o.y),
      (e.forwardZ.value = o.z),
      (e.upX.value = n.x),
      (e.upY.value = n.y),
      (e.upZ.value = n.z))
    : (e.setPosition(t.x, t.y, t.z), e.setOrientation(o.x, o.y, o.z, n.x, n.y, n.z));
}
const ok = () => AU.ctx && 'running' === AU.ctx.state,
  GS = {
    rifle: { b: 720, th: 105, len: 0.15, tail: 1, g: 1 },
    smg: { b: 950, th: 135, len: 0.1, tail: 0.6, g: 0.8 },
    dmr: { b: 520, th: 85, len: 0.22, tail: 1.3, g: 1.15 },
    shotgun: { b: 380, th: 66, len: 0.28, tail: 1.4, g: 1.25 },
    sniper: { b: 420, th: 60, len: 0.32, tail: 2, g: 1.4 },
    turret: { b: 820, th: 120, len: 0.1, tail: 0.7, g: 0.8 },
    bot: { b: 700, th: 100, len: 0.15, tail: 1, g: 0.95 }
  };
function sndGun(e, t, o) {
  if (!ok()) return;
  const n = AU.ctx,
    a = GS[e] || GS.rifle,
    r = t ? t.distanceTo(camera.position) : 0,
    s = n.currentTime + 0.004 + (o ? 0 : r / 343),
    l = out(o ? null : t, { ref: 5, roll: 1, rev: o ? 0.55 : 0.9, airK: 90, occl: !o && r < 60 }),
    i = a.g;
  let c = nsrc(AU.white, s, 0.08),
    d = filt('highpass', 2400),
    u = n.createGain();
  (env(u, s, 6e-4, 1.3 * i, 0.045),
    c.connect(d),
    d.connect(u),
    u.connect(l),
    (c = nsrc(AU.white, s, a.len + 0.05)),
    (d = filt('bandpass', 1.7 * a.b, 0.6)),
    d.frequency.setValueAtTime(1.7 * a.b, s),
    d.frequency.exponentialRampToValueAtTime(0.45 * a.b, s + a.len),
    (u = n.createGain()),
    env(u, s, 0.001, 1.8 * i, a.len),
    c.connect(d),
    d.connect(u),
    u.connect(l));
  const p = n.createOscillator();
  ((p.type = 'sine'),
    p.frequency.setValueAtTime(2 * a.th, s),
    p.frequency.exponentialRampToValueAtTime(0.35 * a.th, s + 0.14),
    (u = n.createGain()),
    env(u, s, 0.001, (o ? 1.5 : 0.8) * i, 0.2),
    p.connect(u),
    u.connect(l),
    p.start(s),
    p.stop(s + 0.35),
    (c = nsrc(AU.brown, s, a.tail + 0.1)),
    (d = filt('lowpass', 1400)),
    d.frequency.setValueAtTime(1400, s),
    d.frequency.exponentialRampToValueAtTime(180, s + a.tail),
    (u = n.createGain()),
    env(u, s, 0.006, 0.55 * i, a.tail),
    c.connect(d),
    d.connect(u),
    u.connect(l),
    o &&
      ((c = nsrc(AU.white, s, 0.03)),
      (d = filt('highpass', 5200)),
      (u = n.createGain()),
      env(u, s, 5e-4, 0.35, 0.02),
      c.connect(d),
      d.connect(u),
      u.connect(l),
      AU.duck.gain.cancelScheduledValues(s),
      AU.duck.gain.setValueAtTime(0.72, s),
      AU.duck.gain.linearRampToValueAtTime(1, s + 0.25)));
}
function sndWhiz(e) {
  if (!ok()) return;
  const t = AU.ctx,
    o = t.currentTime,
    n = out(e, { ref: 1, rev: 0.1, air: !1 });
  let a = nsrc(AU.white, o, 0.03),
    r = filt('highpass', 3e3),
    s = t.createGain();
  (env(s, o, 3e-4, 1.6, 0.02),
    a.connect(r),
    r.connect(s),
    s.connect(n),
    (a = nsrc(AU.white, o, 0.25)),
    (r = filt('bandpass', 1800, 3)),
    r.frequency.setValueAtTime(3200, o),
    r.frequency.exponentialRampToValueAtTime(700, o + 0.2),
    (s = t.createGain()),
    env(s, o, 0.01, 0.6, 0.2),
    a.connect(r),
    r.connect(s),
    s.connect(n));
}
function sndImpact(e, t) {
  if (!ok()) return;
  const o = AU.ctx,
    n = o.currentTime + t.distanceTo(camera.position) / 343,
    a = out(t, { ref: 1.5, rev: 0.35, occl: !1 });
  let r, s, l;
  if ('metal' === e)
    for (const e of [rand(1100, 1500), rand(2500, 3200), rand(4200, 5200)]) {
      const t = o.createOscillator();
      ((t.frequency.value = e),
        (l = o.createGain()),
        env(l, n, 0.001, 0.18, rand(0.15, 0.35)),
        t.connect(l),
        l.connect(a),
        t.start(n),
        t.stop(n + 0.5));
    }
  const i = { concrete: 2600, tile: 3e3, metal: 4e3, wood: 700, dirt: 400, sand: 350 }[e] || 1500;
  ((r = nsrc(AU.white, n, 0.12)),
    (s = filt('bandpass', i, 1.1)),
    (l = o.createGain()),
    env(l, n, 8e-4, 0.9, 'wood' === e ? 0.09 : 0.06),
    r.connect(s),
    s.connect(l),
    l.connect(a),
    ('concrete' !== e && 'tile' !== e && 'dirt' !== e && 'sand' !== e) ||
      ((r = nsrc(AU.white, n + 0.02, 0.25)),
      (s = filt('highpass', 'sand' === e ? 1500 : 3500)),
      (l = o.createGain()),
      env(l, n + 0.02, 0.01, 0.18, 0.2),
      r.connect(s),
      s.connect(l),
      l.connect(a)));
}
function sndFlesh(e) {
  if (!ok()) return;
  const t = AU.ctx,
    o = t.currentTime,
    n = out(e, { ref: 1.5, rev: 0.2 }),
    a = nsrc(AU.brown, o, 0.15),
    r = filt('lowpass', 420),
    s = t.createGain();
  (env(s, o, 0.001, 2.2, 0.11), a.connect(r), r.connect(s), s.connect(n));
  const l = nsrc(AU.white, o, 0.05),
    i = filt('bandpass', 1300, 2),
    c = t.createGain();
  (env(c, o, 0.001, 0.4, 0.04), l.connect(i), i.connect(c), c.connect(n));
}
const STEP = {
  concrete: [1800, 0.05, 0.5],
  tile: [2400, 0.045, 0.55],
  metal: [2600, 0.07, 0.5],
  wood: [420, 0.07, 0.9],
  dirt: [900, 0.09, 0.45],
  sand: [1300, 0.12, 0.35],
  grass: [3e3, 0.1, 0.3]
};
function sndStep(e, t, o = 1, n = !1) {
  if (!ok()) return;
  const a = AU.ctx,
    r = a.currentTime,
    s = STEP[e] || STEP.concrete,
    l = out(t, { ref: 1, roll: 1.6, rev: 0.25, occl: !!t }),
    i = o * (n ? 1.3 : 1);
  let c = nsrc(AU.white, r, s[1] + 0.05),
    d = filt('bandpass', s[0] * rand(0.85, 1.15), 1.2),
    u = a.createGain();
  if (
    (env(u, r, 0.004, s[2] * i, s[1]),
    c.connect(d),
    d.connect(u),
    u.connect(l),
    (c = nsrc(AU.brown, r, 0.08)),
    (d = filt('lowpass', 220)),
    (u = a.createGain()),
    env(u, r, 0.003, 0.9 * i, 0.06),
    c.connect(d),
    d.connect(u),
    u.connect(l),
    'dirt' === e || 'sand' === e)
  )
    for (let e = 0; e < 3; e++) {
      const e = r + rand(0.005, 0.05);
      ((c = nsrc(AU.white, e, 0.02)),
        (d = filt('highpass', 4e3)),
        (u = a.createGain()),
        env(u, e, 0.001, 0.12 * i, 0.015),
        c.connect(d),
        d.connect(u),
        u.connect(l));
    }
  if (!t && Math.random() < 0.35) {
    const e = r + 0.03;
    ((c = nsrc(AU.white, e, 0.05)),
      (d = filt('bandpass', 5200, 4)),
      (u = a.createGain()),
      env(u, e, 0.002, 0.06, 0.04),
      c.connect(d),
      d.connect(u),
      u.connect(l));
  }
}
function click(e, t, o, n, a) {
  if (!ok()) return;
  const r = AU.ctx,
    s = nsrc(AU.white, e, o + 0.02),
    l = filt('bandpass', t, 2),
    i = r.createGain();
  (env(i, e, 5e-4, n, o), s.connect(l), l.connect(i), i.connect(a || out(null, { rev: 0.15 })));
}
function sndReload(e) {
  if (!ok()) return;
  const t = AU.ctx.currentTime,
    o = out(null, { rev: 0.15 });
  if (e.shell) return (click(t + 0.15, 2400, 0.03, 0.5, o), void click(t + 0.3, 900, 0.05, 0.4, o));
  (click(t + 0.25, 1800, 0.04, 0.6, o),
    click(t + 0.32, 700, 0.06, 0.5, o),
    click(t + 0.55 * e.reload, 1400, 0.04, 0.6, o),
    click(t + 0.58 * e.reload, 3200, 0.02, 0.7, o),
    click(t + 0.85 * e.reload, 2200, 0.03, 0.7, o),
    click(t + 0.88 * e.reload, 900, 0.05, 0.5, o));
}
function sndBolt() {
  if (!ok()) return;
  const e = AU.ctx.currentTime,
    t = out(null, { rev: 0.15 });
  (click(e + 0.15, 1600, 0.04, 0.6, t),
    click(e + 0.32, 2600, 0.03, 0.6, t),
    click(e + 0.5, 2900, 0.03, 0.6, t),
    click(e + 0.62, 1400, 0.05, 0.6, t));
}
function sndPump() {
  if (!ok()) return;
  const e = AU.ctx.currentTime,
    t = out(null, { rev: 0.2 });
  (click(e + 0.12, 900, 0.08, 0.8, t), click(e + 0.28, 1300, 0.07, 0.8, t));
}
function sndDry() {
  ok() && click(AU.ctx.currentTime, 3500, 0.015, 0.5);
}
function sndShell(e) {
  if (!ok() || e.distanceTo(camera.position) > 12) return;
  const t = AU.ctx,
    o = t.currentTime,
    n = out(e, { ref: 0.6, rev: 0.1 });
  for (const e of [rand(4e3, 5200), rand(6800, 7800)]) {
    const a = t.createOscillator();
    a.frequency.value = e;
    const r = t.createGain();
    (env(r, o, 5e-4, 0.05, 0.12), a.connect(r), r.connect(n), a.start(o), a.stop(o + 0.2));
  }
}
function sndHit(e) {
  if (!ok()) return;
  const t = AU.ctx,
    o = t.currentTime,
    n = t.createOscillator();
  ((n.type = 'square'), (n.frequency.value = e ? 1400 : 2600));
  const a = t.createGain();
  env(a, o, 0.001, e ? 0.12 : 0.07, e ? 0.12 : 0.04);
  const r = filt('bandpass', e ? 1400 : 2600, 4);
  (n.connect(r), r.connect(a), a.connect(AU.sfx), n.start(o), n.stop(o + 0.2));
}
function sndHurt() {
  if (!ok()) return;
  const e = AU.ctx,
    t = e.currentTime,
    o = nsrc(AU.brown, t, 0.2),
    n = filt('lowpass', 300),
    a = e.createGain();
  (env(a, t, 0.002, 2, 0.18), o.connect(n), n.connect(a), a.connect(AU.sfx));
}
function sndThunder() {
  if (!ok()) return;
  const e = AU.ctx,
    t = e.currentTime;
  for (let o = 0; o < 2; o++) {
    const n = nsrc(AU.brown, t + 0.35 * o, 3.2, 0.7 + 0.2 * Math.random()),
      a = filt('lowpass', 260 - 80 * o),
      r = e.createGain();
    (env(r, t + 0.35 * o, 0.25, 0.9 - 0.3 * o, 2.8), n.connect(a), a.connect(r), r.connect(AU.ambG));
  }
}
function sndBoom(e, t) {
  if (!ok()) return;
  const o = AU.ctx,
    n = e.distanceTo(camera.position),
    a = o.currentTime + n / 343,
    r = out(e, { ref: 4, roll: 0.8, rev: 1.2, airK: 120 });
  let s = nsrc(AU.white, a, 0.1),
    l = filt('highpass', 1500),
    i = o.createGain();
  (env(i, a, 0.001, 2.5, 0.08),
    s.connect(l),
    l.connect(i),
    i.connect(r),
    (s = nsrc(AU.brown, a, 2)),
    (l = filt('lowpass', t ? 1200 : 500)),
    l.frequency.setValueAtTime(t ? 1800 : 900, a),
    l.frequency.exponentialRampToValueAtTime(70, a + 1.6),
    (i = o.createGain()),
    env(i, a, 0.004, 4, 1.6),
    s.connect(l),
    l.connect(i),
    i.connect(r));
  const c = o.createOscillator();
  (c.frequency.setValueAtTime(70, a),
    c.frequency.exponentialRampToValueAtTime(25, a + 0.6),
    (i = o.createGain()),
    env(i, a, 0.002, 3, 0.7),
    c.connect(i),
    i.connect(r),
    c.start(a),
    c.stop(a + 1),
    t ||
      ((s = nsrc(AU.white, a + 0.1, 1.4)),
      (l = filt('highpass', 3e3)),
      (i = o.createGain()),
      env(i, a + 0.1, 0.05, 0.25, 1.2),
      s.connect(l),
      l.connect(i),
      i.connect(r)));
}
function sndBounce(e) {
  ok() && click(AU.ctx.currentTime, rand(2500, 3500), 0.03, 0.5, out(e, { ref: 1, rev: 0.2 }));
}
function sndTinnitus(e) {
  if (!ok()) return;
  const t = AU.ctx,
    o = t.currentTime,
    n = t.createOscillator();
  n.frequency.value = 6400;
  const a = t.createGain();
  (a.gain.setValueAtTime(1e-4, o),
    a.gain.linearRampToValueAtTime(0.08 * e, o + 0.05),
    a.gain.exponentialRampToValueAtTime(1e-4, o + 2.5 + 3 * e),
    n.connect(a),
    a.connect(AU.master),
    n.start(o),
    n.stop(o + 6),
    AU.sfx.gain.cancelScheduledValues(o),
    AU.sfx.gain.setValueAtTime(0.15, o),
    AU.sfx.gain.linearRampToValueAtTime(1, o + 1.5 + 3 * e));
}
function sndBark(e) {
  if (!ok()) return;
  const t = AU.ctx,
    o = out(e, { ref: 2, rev: 0.5, occl: !0 });
  for (let e = 0; e < rand(1, 3); e++) {
    const n = t.currentTime + e * rand(0.2, 0.3),
      a = t.createOscillator();
    ((a.type = 'sawtooth'),
      a.frequency.setValueAtTime(rand(380, 460), n),
      a.frequency.exponentialRampToValueAtTime(rand(220, 280), n + 0.14));
    const r = nsrc(AU.white, n, 0.2),
      s = filt('bandpass', 900, 2),
      l = filt('bandpass', 2400, 3),
      i = t.createGain();
    (env(i, n, 0.008, 0.7, 0.14),
      a.connect(s),
      r.connect(l),
      s.connect(i),
      l.connect(i),
      i.connect(o),
      a.start(n),
      a.stop(n + 0.25));
  }
}
function sndGrowl(e) {
  if (!ok()) return;
  const t = AU.ctx,
    o = t.currentTime,
    n = out(e, { ref: 1.5, rev: 0.3 }),
    a = t.createOscillator();
  ((a.type = 'sawtooth'), (a.frequency.value = rand(70, 90)));
  const r = t.createOscillator();
  r.frequency.value = 22;
  const s = t.createGain();
  ((s.gain.value = 25), r.connect(s), s.connect(a.frequency));
  const l = filt('lowpass', 500),
    i = t.createGain();
  (env(i, o, 0.05, 0.6, 0.5),
    a.connect(l),
    l.connect(i),
    i.connect(n),
    a.start(o),
    r.start(o),
    a.stop(o + 0.7),
    r.stop(o + 0.7));
}
function sndRadio() {
  if (!ok()) return;
  const e = AU.ctx,
    t = e.currentTime,
    o = nsrc(AU.white, t, 0.25),
    n = filt('bandpass', 2200, 1.5),
    a = e.createGain();
  (env(a, t, 0.005, 0.35, 0.18), o.connect(n), n.connect(a), a.connect(AU.sfx));
  const r = e.createOscillator();
  r.frequency.value = 1800;
  const s = e.createGain();
  (env(s, t, 0.002, 0.08, 0.07), r.connect(s), s.connect(AU.sfx), r.start(t), r.stop(t + 0.12));
}
function radio(e) {
  sndRadio();
  try {
    if (!('speechSynthesis' in window)) return;
    const t = new SpeechSynthesisUtterance(e);
    ((t.lang = 'es-ES'), (t.rate = 1.08), (t.pitch = 0.75), (t.volume = 0.75));
    const o = speechSynthesis.getVoices().find(e => /^es/i.test(e.lang));
    (o && (t.voice = o),
      setTimeout(() => {
        try {
          speechSynthesis.speak(t);
        } catch (e) {}
      }, 220));
  } catch (e) {}
}
function sndBeat() {
  if (!ok()) return;
  const e = AU.ctx,
    t = e.currentTime;
  for (const o of [0, 0.18]) {
    const n = e.createOscillator();
    (n.frequency.setValueAtTime(65, t + o), n.frequency.exponentialRampToValueAtTime(38, t + o + 0.12));
    const a = e.createGain();
    (env(a, t + o, 0.01, o ? 0.35 : 0.5, 0.14),
      n.connect(a),
      a.connect(AU.master),
      n.start(t + o),
      n.stop(t + o + 0.2));
  }
}
function sndBreath(e) {
  if (!ok()) return;
  const t = AU.ctx,
    o = t.currentTime,
    n = nsrc(AU.white, o, 0.6),
    a = filt('bandpass', e ? 900 : 700, 0.8),
    r = t.createGain();
  (env(r, o, 0.15, e ? 0.05 : 0.025, e ? 0.3 : 0.45), n.connect(a), a.connect(r), r.connect(AU.master));
}
function sndAbility() {
  if (!ok()) return;
  const e = AU.ctx,
    t = e.currentTime;
  for (const [o, n] of [
    [0, 880],
    [0.09, 1320]
  ]) {
    const a = e.createOscillator();
    ((a.type = 'triangle'), (a.frequency.value = n));
    const r = e.createGain();
    (env(r, t + o, 0.005, 0.08, 0.12), a.connect(r), r.connect(AU.sfx), a.start(t + o), a.stop(t + o + 0.2));
  }
}
function sndInject() {
  if (!ok()) return;
  const e = AU.ctx.currentTime;
  click(e, 3e3, 0.02, 0.5);
  const t = nsrc(AU.white, e + 0.05, 0.4),
    o = filt('highpass', 6e3),
    n = AU.ctx.createGain();
  (env(n, e + 0.05, 0.02, 0.12, 0.3), t.connect(o), o.connect(n), n.connect(AU.sfx));
}
function loopNoise(e, t, o, n) {
  const a = AU.ctx,
    r = a.createBufferSource();
  ((r.buffer = e), (r.loop = !0));
  let s = r;
  for (const e of t) (s.connect(e), (s = e));
  const l = a.createGain();
  if (((l.gain.value = o), s.connect(l), n)) {
    const e = a.createPanner();
    ((e.panningModel = 'HRTF'),
      (e.refDistance = 1.5),
      (e.rolloffFactor = 1.4),
      setPos(e, n),
      l.connect(e),
      e.connect(AU.ambG));
  } else l.connect(AU.ambG);
  return (r.start(), AU.amb.push(r), l);
}
function lfoOn(e, t, o, n) {
  const a = AU.ctx,
    r = a.createOscillator();
  r.frequency.value = t;
  const s = a.createGain();
  ((s.gain.value = o), r.connect(s), s.connect(e), (e.value = n), r.start(), AU.amb.push(r));
}
function stopAmbience() {
  for (const e of AU.amb)
    try {
      e.stop();
    } catch (e) {}
  AU.amb = [];
}
function startAmbience() {
  if (!AU.ctx) return;
  stopAmbience();
  const e = AU.ctx,
    t = LV.post.ambience;
  if (
    ((AU.next = {}),
    (AU.rainG = G.rain ? loopNoise(AU.white, [filt('highpass', 450), filt('lowpass', 5200)], 0.11) : null),
    loopNoise(AU.white, [filt('highpass', 2500), filt('lowpass', 9e3)], 0.009),
    loopNoise(AU.brown, [filt('lowpass', 140)], 0.05),
    'school' === t)
  ) {
    (lfoOn(loopNoise(AU.brown, [filt('lowpass', 380)], 0.12).gain, 0.05, 0.06, 0.12),
      loopNoise(AU.white, [filt('highpass', 1800), filt('lowpass', 6e3)], 0.012));
    for (const t of LV.hum) {
      const o = e.createOscillator();
      ((o.type = 'sawtooth'), (o.frequency.value = 120));
      const n = filt('bandpass', 240, 4),
        a = e.createGain();
      a.gain.value = 0.05;
      const r = e.createPanner();
      ((r.panningModel = 'HRTF'),
        (r.refDistance = 1),
        (r.rolloffFactor = 1.6),
        setPos(r, t),
        o.connect(n),
        n.connect(a),
        a.connect(r),
        r.connect(AU.ambG),
        o.start(),
        AU.amb.push(o));
    }
  }
  ('forest' === t &&
    (lfoOn(loopNoise(AU.white, [filt('bandpass', 700, 0.5), filt('lowpass', 2500)], 0.05).gain, 0.08, 0.035, 0.05),
    loopNoise(AU.brown, [filt('lowpass', 250)], 0.12),
    LV.fire && loopNoise(AU.white, [filt('bandpass', 3e3, 0.7)], 0.02, LV.fire)),
    'desert' === t &&
      (lfoOn(loopNoise(AU.white, [filt('bandpass', 500, 0.6)], 0.07).gain, 0.11, 0.05, 0.07),
      loopNoise(AU.white, [filt('highpass', 4500)], 0.015),
      loopNoise(AU.brown, [filt('lowpass', 200)], 0.2)));
}
function ambienceTick(e) {
  if (!ok()) return;
  const t = AU.ctx,
    o = LV.post.ambience,
    n = AU.next,
    a = camera.position,
    r = (t, o, a) => (void 0 === n[t] && (n[t] = e + rand(o, a)), e >= n[t] && ((n[t] = e + rand(o, a)), !0)),
    s = e => V3(a.x + rand(-e, e), a.y + rand(0, 8), a.z + rand(-e, e));
  if ('forest' === o) {
    if (r('bird', 1.5, 5)) {
      const e = out(s(30), { ref: 3, rev: 0.6 }),
        o = rand(2400, 4600),
        n = 0 | rand(2, 6);
      for (let a = 0; a < n; a++) {
        const n = t.currentTime + a * rand(0.08, 0.16),
          r = t.createOscillator();
        (r.frequency.setValueAtTime(o * rand(0.9, 1.2), n),
          r.frequency.exponentialRampToValueAtTime(o * rand(0.6, 1.5), n + 0.07));
        const s = t.createGain();
        (env(s, n, 0.005, 0.06, 0.07), r.connect(s), s.connect(e), r.start(n), r.stop(n + 0.1));
      }
    }
    if (r('crow', 12, 30)) {
      const e = out(s(50), { ref: 5, rev: 0.8 });
      for (let o = 0; o < 3; o++) {
        const n = t.currentTime + 0.42 * o,
          a = nsrc(AU.white, n, 0.3),
          r = filt('bandpass', rand(800, 1100), 5),
          s = t.createOscillator();
        ((s.type = 'sawtooth'), (s.frequency.value = rand(300, 360)));
        const l = filt('bandpass', 1200, 3),
          i = t.createGain();
        (env(i, n, 0.02, 0.25, 0.22),
          a.connect(r),
          s.connect(l),
          r.connect(i),
          l.connect(i),
          i.connect(e),
          s.start(n),
          s.stop(n + 0.3));
      }
    }
    if (r('owl', 18, 40)) {
      const e = out(s(60), { ref: 5, rev: 0.9 });
      for (const [o, n] of [
        [0, 420],
        [0.5, 380],
        [0.8, 380]
      ]) {
        const a = t.currentTime + o,
          r = t.createOscillator();
        r.frequency.value = n;
        const s = t.createGain();
        (env(s, a, 0.05, 0.08, 0.3), r.connect(s), s.connect(e), r.start(a), r.stop(a + 0.5));
      }
    }
    if (
      (LV.fire &&
        r('crack', 0.15, 0.6) &&
        a.distanceTo(LV.fire) < 25 &&
        click(t.currentTime, rand(1500, 4e3), 0.01, rand(0.2, 0.6), out(LV.fire, { ref: 1, rev: 0.2 })),
      r('creak', 10, 25))
    ) {
      const e = out(s(20), { ref: 2, rev: 0.6 }),
        o = t.createOscillator();
      ((o.type = 'sawtooth'),
        o.frequency.setValueAtTime(rand(90, 140), t.currentTime),
        o.frequency.linearRampToValueAtTime(rand(60, 90), t.currentTime + 1.2));
      const n = filt('bandpass', 600, 6),
        a = t.createGain();
      (env(a, t.currentTime, 0.2, 0.08, 1),
        o.connect(n),
        n.connect(a),
        a.connect(e),
        o.start(),
        o.stop(t.currentTime + 1.5));
    }
  }
  if ('school' === o) {
    if (r('drip', 0.8, 3)) {
      const e = V3(a.x + rand(-10, 10), 2, a.z + rand(-8, 8)),
        o = t.createOscillator(),
        n = out(e, { ref: 1, rev: 0.8 }),
        r = t.currentTime;
      (o.frequency.setValueAtTime(rand(900, 1400), r),
        o.frequency.exponentialRampToValueAtTime(rand(1800, 2600), r + 0.04));
      const s = t.createGain();
      (env(s, r, 0.001, 0.06, 0.06), o.connect(s), s.connect(n), o.start(r), o.stop(r + 0.1));
    }
    if (r('bang', 14, 35)) {
      const e = out(s(25), { ref: 2, rev: 1.3, occl: !0 }),
        o = nsrc(AU.brown, t.currentTime, 0.4),
        n = filt('lowpass', 600),
        a = t.createGain();
      (env(a, t.currentTime, 0.002, 1.2, 0.3), o.connect(n), n.connect(a), a.connect(e));
    }
    if (r('door', 9, 22)) {
      const e = out(s(20), { ref: 2, rev: 1, occl: !0 }),
        o = t.createOscillator();
      ((o.type = 'square'),
        o.frequency.setValueAtTime(rand(300, 500), t.currentTime),
        o.frequency.linearRampToValueAtTime(rand(150, 250), t.currentTime + 1.5));
      const n = filt('bandpass', 900, 10),
        a = t.createGain();
      (env(a, t.currentTime, 0.3, 0.03, 1.2),
        o.connect(n),
        n.connect(a),
        a.connect(e),
        o.start(),
        o.stop(t.currentTime + 2));
    }
  }
  if ('desert' === o) {
    if ((r('dog', 10, 25) && sndBark(s(70)), r('arty', 20, 45))) {
      const e = out(V3(a.x + rand(-300, 300), 0, a.z + rand(-300, 300)), { ref: 60, roll: 0.3, rev: 1.5, air: !1 }),
        o = nsrc(AU.brown, t.currentTime, 2.5),
        n = filt('lowpass', 160),
        r = t.createGain();
      (env(r, t.currentTime, 0.05, 1.6, 2.2), o.connect(n), n.connect(r), r.connect(e));
    }
    if (r('sign', 6, 14)) {
      const e = out(s(15), { ref: 1.5, rev: 0.3 });
      for (let o = 0; o < 2; o++) {
        const n = t.currentTime + 0.7 * o,
          a = t.createOscillator();
        ((a.type = 'triangle'),
          a.frequency.setValueAtTime(rand(500, 700), n),
          a.frequency.linearRampToValueAtTime(rand(300, 450), n + 0.4));
        const r = t.createGain();
        (env(r, n, 0.1, 0.03, 0.35), a.connect(r), r.connect(e), a.start(n), a.stop(n + 0.6));
      }
    }
  }
}
function sndSwish() {
  if (!ok()) return;
  const e = AU.ctx,
    t = e.currentTime,
    o = nsrc(AU.white, t, 0.25),
    n = filt('bandpass', 900, 1.2);
  (n.frequency.setValueAtTime(600, t), n.frequency.exponentialRampToValueAtTime(2600, t + 0.16));
  const a = e.createGain();
  (env(a, t, 0.02, 0.35, 0.16), o.connect(n), n.connect(a), a.connect(AU.sfx));
}
