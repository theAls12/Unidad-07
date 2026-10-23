/* Combate: disparos, impactos, daño y cuerpo a cuerpo */
function hitSpheres(e, t) {
  const o = 1 - 0.36 * t;
  return [
    [0, 1.63 * o, 0, 0.13, 2],
    [0, 1.3 * o, 0, 0.25, 1],
    [0, 1 * o, 0, 0.22, 1],
    [0.1, 0.55 * o, 0, 0.15, 0],
    [-0.1, 0.55 * o, 0, 0.15, 0],
    [0.1, 0.22, 0, 0.13, 0],
    [-0.1, 0.22, 0, 0.13, 0]
  ].map(t => [e.x + t[0], e.y + t[1], e.z + t[2], t[3], t[4]]);
}
function raySphere(e, t, o, n, a, r) {
  const s = e.x - o,
    l = e.y - n,
    i = e.z - a,
    c = s * t.x + l * t.y + i * t.z,
    d = c * c - (s * s + l * l + i * i - r * r);
  return d < 0 ? -1 : -c - Math.sqrt(d);
}
function charTargets(e) {
  const t = [];
  for (const e of BOTS)
    e.alive &&
      e.ready &&
      !sameTeam(NET.me, 'b' + e.i) &&
      t.push({ key: 'b' + e.i, to: 'b', id: e.i, pos: e.vpos, cr: e.vcr, dog: !1, model: e.model });
  for (const [o, n] of REMOTE)
    n.alive &&
      o !== e &&
      !sameTeam(NET.me, o) &&
      t.push({ key: o, to: o, id: 0, pos: n.pos, cr: n.cr, model: n.model });
  return t;
}
function rayChars(e, t, o, n) {
  let a = o,
    r = null;
  for (const o of n) {
    const n = o.pos.x - e.x,
      s = o.pos.z - e.z;
    if (!(n * t.x + s * t.z < 0))
      if (o.model && o.model.soldier) {
        const n = o.pos.x - e.x,
          s = o.pos.z - e.z,
          l = o.pos.y + 1 - e.y,
          i = n * t.x + l * t.y + s * t.z;
        if (n * n + l * l + s * s - i * i > 2.2) continue;
        for (const [n, s, l] of boneZones(o.model)) {
          const i = raySphere(e, t, n.x, n.y, n.z, s);
          i > 0 && i < a && ((a = i), (r = { t: i, key: o.key, to: o.to, id: o.id, zone: l, hs: 'h' === l }));
        }
      } else
        for (const n of hitSpheres(o.pos, o.cr)) {
          const s = raySphere(e, t, n[0], n[1], n[2], n[3]);
          if (s > 0 && s < a) {
            a = s;
            const e = 2 === n[4] ? 'h' : 1 === n[4] ? 'c' : 'l';
            r = { t: s, key: o.key, to: o.to, id: o.id, zone: e, hs: 'h' === e };
          }
        }
  }
  return r;
}
function shoot() {
  const e = P.w;
  (P.ammo--,
    (P.fireCD = 60 / e.rpm),
    e.bolt && ((P.bolt = 60 / e.rpm), setTimeout(sndBolt, 140)),
    'shotgun' === e.key && setTimeout(sndPump, 220),
    camera.updateMatrixWorld(),
    camera.getWorldPosition(_eye));
  const t = V3(0, 0, -1).applyQuaternion(camera.quaternion),
    o = V3(1, 0, 0).applyQuaternion(camera.quaternion),
    n = V3(0, 1, 0).applyQuaternion(camera.quaternion);
  let a = curSpread(e);
  (e.scope && P.ads < 0.9 && (a = e.spread),
    (P.bloom = Math.min(0.035, P.bloom + (e.auto ? 0.0022 : 0.004) * (1 - 0.6 * P.ads))));
  const r = e.pel || 1,
    s = new Map(),
    l = charTargets(NET.me);
  let i = null,
    c = 'concrete',
    d = !1;
  VM.root.updateMatrixWorld(!0);
  const u = VM.gun.muzzle.getWorldPosition(V3());
  for (let u = 0; u < r; u++) {
    const r = Math.random() * TAU,
      u = Math.sqrt(Math.random()) * a;
    _d.copy(t)
      .addScaledVector(o, Math.cos(r) * u)
      .addScaledVector(n, Math.sin(r) * u)
      .normalize();
    const p = rayWorld(_eye, _d, 450),
      m = p ? p.t : 450,
      h = p ? { p: p.p.clone(), n: p.n.clone(), s: p.surf } : null,
      f = rayChars(_eye, _d, m, l);
    if (f) {
      const t = lerp(1, e.min, smooth(e.r0, e.r1, f.t)),
        o = 'h' === f.zone ? e.dmg * e.hs * Math.max(t, 0.85) : e.dmg * t * ZONE_MUL[f.zone];
      s.has(f.key) || s.set(f.key, { to: f.to, id: f.id, d: 0, hs: !1 });
      const n = s.get(f.key);
      ((n.d += o), (n.hs = n.hs || f.hs));
      const a = V3().copy(_eye).addScaledVector(_d, f.t);
      (bloodFX(a, _d), i || (i = a), (d = !0), (c = 'flesh'));
    } else
      h ? (impactFX(h.p, h.n, h.s), i || ((i = h.p), (c = h.s))) : i || (i = V3().copy(_eye).addScaledVector(_d, 450));
  }
  const p = [...s.values()].map(e => [e.to, e.id, Math.round(e.d), e.hs ? 1 : 0]);
  if (
    (d && ((G.hitT = 0.16), (G.hitKill = !1), sndHit(!1)),
    (!e.auto || Math.random() < 0.4) && tracer(u, i),
    muzzleSprite(u, 'smg' === e.key ? 0.3 : 'shotgun' === e.key ? 0.55 : 0.42),
    muzzleLight(u, 'sniper' === e.key ? 80 : 45),
    particle(SPR.smoke, u, V3().copy(t).multiplyScalar(1.2), {
      color: 12303291,
      life: 0.9,
      size: 0.05,
      grow: 0.4,
      op: 0.25,
      drag: 3,
      g: -0.2
    }),
    !e.bolt && 'shotgun' !== e.key)
  ) {
    const e = V3(0.04, 0.02, -0.02);
    (VM.gun.g.localToWorld(e), ejectShell(e, o));
  }
  sndGun(e.snd, null, !0);
  const m = e.rec * (1 - 0.35 * P.ads) * rand(0.85, 1.15);
  ((P.pitch += 0.45 * m),
    (P.recP += 0.55 * m),
    (P.recY += rand(-1, 1) * e.recY),
    (VM.kick += e.kick),
    (G.shake = Math.min(0.6, G.shake + 1.2 * e.kick)),
    queueShot(NET.me, G.name, { o: arr(u), e: arr(i), w: e.snd, h: p, sf: c }),
    (G.lastShot = G.t));
}
function queueShot(e, t, o) {
  if (!NET.online)
    return void dispatch('shot', { data: { s: e, sn: t, l: [Object.assign(o, { dt: 0 })] }, sameTab: !0, isMe: !0 });
  let n = SHOTQ.get(e);
  (n || ((n = { sn: t, list: [], t0: performance.now() }), SHOTQ.set(e, n)),
    (o.dt = Math.round(performance.now() - n.t0)),
    n.list.push(o));
}
function flushShots() {
  for (const [e, t] of SHOTQ) netEmit('shot', { s: e, sn: t.sn, l: t.list });
  SHOTQ.clear();
}
function onShot(e) {
  const t = e.data;
  if (!t || !Array.isArray(t.l)) return;
  const o = String(t.s || ''),
    n = String(t.sn || 'Hostil').slice(0, 24);
  let a = !1;
  for (const r of t.l.slice(0, 30))
    if (r && Array.isArray(r.o) && Array.isArray(r.e)) {
      NET.host && !a && 'knife' !== r.w && ((a = !0), botHear(vec(r.o), 45, o));
      for (const e of (Array.isArray(r.h) ? r.h : []).slice(0, 8)) {
        const t = String(e[0]),
          a = 0 | e[1],
          s = clamp(+e[2] || 0, 0, 500),
          l = !!e[3];
        'b' === t
          ? NET.host && damageBot(a, s, o, n, l, String(r.w))
          : t === NET.me && P.alive && damageMe(s, o, n, vec(r.o), String(r.w));
      }
      if (!e.sameTab) {
        const e = clamp(0 | r.dt, 0, 400);
        e ? setTimeout(() => shotFX(o, r), e) : shotFX(o, r);
      }
    }
}
function shotFX(e, t) {
  const o = vec(t.o),
    n = vec(t.e);
  (sndGun(String(t.w), o, !1), muzzleSprite(o, 0.45), muzzleLight(o, 30), Math.random() < 0.5 && tracer(o, n));
  const a = V3().subVectors(n, o).normalize();
  (Array.isArray(t.h) && t.h.length
    ? bloodFX(n, a)
    : t.sf && 'flesh' !== t.sf && impactFX(n, a.clone().negate(), String(t.sf)),
    G.reveal.set(e, { p: o, t: G.t }));
  const r = camera.position,
    s = V3().subVectors(n, o),
    l = s.length();
  if (l > 1) {
    const e = clamp(V3().subVectors(r, o).dot(s) / (l * l), 0, 1),
      t = V3().copy(o).addScaledVector(s, e);
    t.distanceTo(r) < 2.6 && o.distanceTo(r) > 4 && sndWhiz(t);
  }
}
function damageMe(e, t, o, n, a) {
  if (!P.alive) return;
  let r = e;
  if (P.armor > 0) {
    const e = Math.min(P.armor, 0.75 * r);
    ((P.armor -= e), (r -= e));
  }
  if (
    ((P.hp -= r),
    (P.lastHurt = G.t),
    (G.dmg = Math.min(1, G.dmg + r / 40)),
    (G.shake = Math.min(0.8, G.shake + 0.012 * r)),
    r > 6 && (G.blood < 0.15 && (G.bloodSeed = 100 * Math.random()), (G.blood = Math.min(1, G.blood + r / 70))),
    sndHurt(),
    n)
  ) {
    const e = Math.atan2(n.x - P.pos.x, n.z - P.pos.z);
    G.dmgDirs.push({ a: e, t: 1.4 });
  }
  P.hp <= 0 && die(t, o, a);
}
function die(e, t, o) {
  if (!P.alive) return;
  ((P.alive = !1), (P.hp = 0), (P.respawn = 4.5), (P.deathT = 0), G.deaths++, (G.streak = 0), updateStreakHud());
  const n = e === NET.me,
    a = n ? G.name : t;
  (netEmit('kill', { v: NET.me, vn: G.name, k: e, kn: a, w: o }),
    ($('#death').hidden = !1),
    ($('#deathBy').textContent = (n ? 'Muerte propia' : `Abatido por ${a}`) + ' · Esc para cambiar de clase'),
    (MOUSE.l = MOUSE.r = !1));
}
function onKill(e) {
  const t = e.data;
  if (!t) return;
  const o = String(t.v),
    n = String(t.k),
    a = String(t.vn || '?').slice(0, 24),
    r = String(t.kn || '?').slice(0, 24),
    s = String(t.w || '');
  if ((addFeed(r, a, s, n === NET.me || o === NET.me), 'gun' !== G.gm))
    try {
      if (o.startsWith('b') && BOTS[+o.slice(1)]) {
        const e = BOTS[+o.slice(1)];
        spawnDrop(e.wpn, e.vpos);
      } else if (o === NET.me) spawnDrop(P.w.key, P.pos);
      else {
        const e = REMOTE.get(o);
        e && spawnDrop(e.wk || 'rifle', e.pos);
      }
    } catch (e) {}
  const l = (e, t) => {
    SCORE.has(e) || SCORE.set(e, { n: t, k: 0, d: 0 });
    const o = SCORE.get(e);
    return ((o.n = t), o);
  };
  (l(o, a).d++,
    n !== o && l(n, r).k++,
    n === NET.me &&
      o !== NET.me &&
      (G.kills++,
      (G.hitT = 0.35),
      (G.hitKill = !0),
      sndHit(!0),
      'turret' !== s && 'dog' !== s && (G.streak++, checkStreak())),
    modeOnKill(o, n, a, r, s));
}
function doMelee() {
  if (!P.alive || G.paused || P.meleeCD > 0) return;
  ((P.meleeCD = P.w && P.w.melee ? 0.55 : 0.85), (VM.melee = 0.32), sndSwish(), camera.updateMatrixWorld());
  const e = camera.getWorldPosition(V3()),
    t = V3(0, 0, -1).applyQuaternion(camera.quaternion);
  let o = null,
    n = 2.4;
  for (const a of charTargets(NET.me)) {
    const r = V3(a.pos.x, a.pos.y + 1.1 - 0.4 * a.cr, a.pos.z),
      s = r.distanceTo(e);
    s > n || V3().subVectors(r, e).normalize().dot(t) < 0.75 || (losClear(e, r) && ((n = s), (o = { t: a, c: r })));
  }
  o &&
    setTimeout(() => {
      (bloodFX(o.c, t),
        (G.hitT = 0.2),
        (G.hitKill = !1),
        sndHit(!1),
        queueShot(NET.me, G.name, { o: arr(e), e: arr(o.c), w: 'knife', h: [[o.t.to, o.t.id, 100, 0]], sf: 'flesh' }));
    }, 110);
}
