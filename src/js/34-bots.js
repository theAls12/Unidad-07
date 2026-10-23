/* Bots: creación, percepción, movimiento y disparo */
function setBotWeapon(e, t) {
  (WEAPONS[t] || (t = 'rifle'), (e.wpn = t));
  const o = e.model.gun;
  if (!o) return;
  for (let e = o.children.length - 1; e >= 0; e--) {
    const t = o.children[e];
    t.userData.wg && o.remove(t);
  }
  const n = worldGun(t);
  ((n.rotation.y = Math.PI), (n.userData.wg = 1), o.add(n), setHold(e.model.gripT, e.model.guardT, t));
}
function makeBotModel(e) {
  e.model && scene.remove(e.model.root);
  const t = 'tdm' === G.gm ? ('A' === e.team ? ['sol2'] : ['gas']) : null;
  ((e.model = makeHuman({ w: e.wpn, pool: t })),
    e.model.gun.children.forEach(e => (e.userData.wg = e.isGroup && e.children.length > 0 ? 1 : 0)),
    scene.add(e.model.root),
    (e.model.root.visible = !1),
    setBotWeapon(e, e.wpn));
}
function newBot(e, t) {
  const o = {
    i: e,
    team: t,
    wpn: 'gun' === G.gm ? GG[0] : ['rifle', 'smg', 'shotgun', 'rifle', 'dmr', 'smg', 'pistol', 'sniper'][e % 8],
    name: 'Hostil «' + BOT_NAMES[e % BOT_NAMES.length] + '»',
    model: null,
    pos: V3(),
    vpos: V3(),
    yaw: 0,
    vyaw: 0,
    hp: 100,
    alive: !1,
    ready: !1,
    respawn: rand(0.3, 2.5),
    path: [],
    repath: 0,
    seeT: 0,
    fireT: 0.5,
    burst: 0,
    losT: 0,
    vis: null,
    aware: 0,
    lastKnown: null,
    cr: 0,
    vcr: 0,
    spd: 0,
    step: 0,
    strafe: 1,
    strafeT: 0,
    stuck: 0,
    lastP: V3(),
    goal: null,
    react: rand(0.35, 0.7),
    blind: 0,
    net: null,
    deadT: 0,
    patrolGoal: -1
  };
  return (
    'tdm' === G.gm && (o.name = ('A' === t ? 'SWAT «' : 'Máscara «') + BOT_NAMES[e % BOT_NAMES.length] + '»'),
    makeBotModel(o),
    o
  );
}
function makeBots(e, t) {
  for (const e of BOTS) scene.remove(e.model.root);
  BOTS.length = 0;
  const o = humanCounts(),
    n = { A: o.A, B: o.B };
  e = Math.max(0, Math.min(e, (G.gm, 12 - o.A - o.B)));
  for (let o = 0; o < e; o++) {
    let e = 'B';
    if ('tdm' === G.gm) {
      const a = t && t[o];
      ((e = a && n[a] < 6 ? a : n.A < n.B && n.A < 6 ? 'A' : n.B < 6 ? 'B' : 'A'), n[e]++);
    }
    BOTS.push(newBot(o, e));
  }
}
function botRoom(e) {
  const t = humanCounts();
  if ('tdm' === G.gm) {
    let o = t[e];
    for (const t of BOTS) t.team === e && o++;
    return o < 6;
  }
  return t.A + t.B + BOTS.length < 12;
}
function addBot(e) {
  if (!NET.host) return;
  if (('tdm' !== G.gm && (e = 'B'), !botRoom(e)))
    return void center(
      'tdm' === G.gm ? 'EQUIPO LLENO' : 'SALA LLENA',
      'tdm' === G.gm ? 'Máximo 6 por equipo' : 'Máximo 12 operadores'
    );
  const t = newBot(BOTS.length, e);
  ((t.respawn = rand(0.4, 1.2)),
    BOTS.push(t),
    (G.botTeams = BOTS.map(e => e.team)),
    (G.botCount = BOTS.length),
    renderScore());
}
function removeBot(e) {
  if (!NET.host) return;
  let t = -1;
  for (let o = BOTS.length - 1; o >= 0; o--)
    if ('tdm' !== G.gm || BOTS[o].team === e) {
      t = o;
      break;
    }
  if (!(t < 0)) {
    (scene.remove(BOTS[t].model.root), BOTS.splice(t, 1), SCORE.delete('b' + t), G.ggk.delete('b' + t));
    for (let e = t; e < BOTS.length; e++) {
      const t = 'b' + (e + 1),
        o = 'b' + e;
      ((BOTS[e].i = e),
        SCORE.has(t) && (SCORE.set(o, SCORE.get(t)), SCORE.delete(t)),
        G.ggk.has(t) && (G.ggk.set(o, G.ggk.get(t)), G.ggk.delete(t)));
    }
    ((G.botTeams = BOTS.map(e => e.team)), (G.botCount = BOTS.length), renderScore());
  }
}
function playerTargets() {
  const e = [],
    t = CURBOT ? 'b' + CURBOT.i : null;
  !P.alive ||
    (t && sameTeam(t, NET.me)) ||
    e.push({ to: NET.me, id: 0, pos: P.pos, cr: P.crouch, moving: P.spd > 1, loud: G.t - G.lastShot < 1.5 });
  for (const [o, n] of REMOTE)
    !n.alive ||
      (t && sameTeam(t, o)) ||
      e.push({
        to: o,
        id: 0,
        pos: n.pos,
        cr: n.cr,
        moving: n.spd > 1,
        loud: G.reveal.has(o) && G.t - G.reveal.get(o).t < 1.5
      });
  if (CURBOT)
    for (const o of BOTS)
      o !== CURBOT &&
        o.alive &&
        o.ready &&
        !sameTeam(t, 'b' + o.i) &&
        e.push({
          to: 'b',
          id: o.i,
          pos: o.pos,
          cr: o.cr,
          moving: o.spd > 1,
          loud: G.reveal.has('b' + o.i) && G.t - G.reveal.get('b' + o.i).t < 1.5
        });
  return e;
}
function botSpawn(e) {
  const t = pickSpawn(playerTargets().map(e => e.pos));
  (e.pos.copy(t),
    e.vpos.copy(t),
    (e.hp = 100),
    (e.alive = !0),
    (e.ready = !0),
    (e.path = []),
    (e.vis = null),
    (e.aware = 0),
    (e.lastKnown = null),
    (e.yaw = rand(0, TAU)),
    (e.deadT = 0),
    (e.blind = 0));
}
function damageBot(e, t, o, n, a, r) {
  const s = BOTS[e];
  if (!s || !s.alive) return;
  ((s.hp -= t), (s.aware = 8));
  const l = String(o).startsWith('b') ? BOTS[+String(o).slice(1)] : null,
    i = o === NET.me ? P.pos : l ? l.pos : (REMOTE.get(o) || {}).pos;
  (s.model &&
    ((s.model.hitT = 0.32),
    i && (s.model.hitFrom = i.clone()),
    (s.model.hitAmt = clamp(t / 35, 0.35, 1) * (a ? 1.3 : 1))),
    i && (s.lastKnown = i.clone()),
    s.hp <= 0 &&
      ((s.alive = !1),
      (s.respawn = rand(5, 8)),
      (s.deadT = 0),
      netEmit('kill', { v: 'b' + e, vn: s.name, k: o, kn: n, w: r })));
}
function botHear(e, t, o) {
  for (const n of BOTS) {
    if (!n.alive || n.net || 'b' + n.i === o || n.vis) continue;
    const a = n.pos.distanceTo(e);
    if (a > t) continue;
    const r = 0.12 * a;
    ((n.lastKnown = V3(e.x + rand(-r, r), e.y, e.z + rand(-r, r))),
      (n.aware = Math.max(n.aware, 6)),
      (n.investigate = !0));
  }
}
function botMoveDir(e, t) {
  if (
    ((e.repath -= 1 / 60),
    V3(e.pos.x, e.pos.y + 1, e.pos.z),
    V3(t.x, (t.y || 0) + 1, t.z),
    (void 0 === e.directT || e.directT <= 0) &&
      ((e.directT = 0.5), (e.direct = Math.hypot(t.x - e.pos.x, t.z - e.pos.z) < 30 && walkable(e.pos, t))),
    e.direct)
  )
    return ((e.path = []), V3(t.x - e.pos.x, 0, t.z - e.pos.z));
  if (!e.path.length || e.repath <= 0 || !e.goal || e.goal.distanceTo(t) > 3) {
    ((e.repath = 3), (e.goal = V3(t.x, t.y || 0, t.z)));
    const o = nearestWp(e.pos.x, e.pos.z, e.pos.y),
      n = nearestWp(t.x, t.z, t.y || 0);
    e.path = navPath(o, n) || [];
  }
  for (; e.path.length;) {
    const t = LV.wps[e.path[0]];
    if (!(Math.hypot(t.x - e.pos.x, t.z - e.pos.z) < 1.1)) break;
    e.path.shift();
  }
  if (((e.smoothT = (e.smoothT || 0) - 1 / 60), e.path.length > 1 && e.smoothT <= 0)) {
    e.smoothT = 0.25;
    const t = LV.wps[e.path[1]];
    walkable(e.pos, t) && e.path.shift();
  }
  const o = e.path.length ? LV.wps[e.path[0]] : t;
  return V3(o.x - e.pos.x, 0, o.z - e.pos.z);
}
function pickPatrol(e) {
  const t = LV.wps;
  CURBOT = e;
  const o = playerTargets();
  ((CURBOT = null), (e.hunt = o.length && Math.random() < 0.6));
  let n = null;
  if (e.hunt) {
    const e = o[(Math.random() * o.length) | 0].pos;
    n = V3(e.x + rand(-12, 12), 0, e.z + rand(-12, 12));
  }
  let a = (Math.random() * t.length) | 0,
    r = -1e9;
  for (let o = 0; o < 14; o++) {
    const o = (Math.random() * t.length) | 0,
      s = t[o];
    let l = n ? -Math.hypot(s.x - n.x, s.z - n.z) : 0.3 * Math.hypot(s.x - e.pos.x, s.z - e.pos.z);
    for (const t of BOTS) t !== e && t.alive && sameTeam('b' + t.i, 'b' + e.i) && t.patrolGoal === o && (l -= 25);
    (Math.hypot(s.x - e.pos.x, s.z - e.pos.z) < 4 && (l -= 20), l > r && ((r = l), (a = o)));
  }
  return a;
}
function botThink(e, t) {
  if (!e.alive) return ((e.deadT += t), (e.respawn -= t), void (e.respawn <= 0 && botSpawn(e)));
  e.blind = Math.max(0, e.blind - t);
  const o = V3(e.pos.x, e.pos.y + 1.5 - 0.5 * e.cr, e.pos.z),
    n = playerTargets();
  if (((e.losT -= t), e.losT <= 0)) {
    ((e.losT = 0.2 + 0.12 * Math.random()), (e.vis = null));
    let t = 1e9;
    if (e.blind <= 0)
      for (const a of n) {
        const n = a.pos.x - e.pos.x,
          r = a.pos.z - e.pos.z,
          s = Math.hypot(n, r);
        s > 75 ||
          s > t ||
          ((Math.abs(angDiff(e.yaw, yawTo(n, r))) < 1.15 || s < 5 || e.aware > 0 || (a.loud && s < 50)) &&
            losClear(o, V3(a.pos.x, a.pos.y + 1.25 - 0.4 * a.cr, a.pos.z)) &&
            ((t = s), (e.vis = a)));
      }
  }
  let a = null,
    r = 0;
  if (
    ((e.cr = approach(e.cr, e.crW ? 1 : 0, 4 * t)),
    (e.coverT = Math.max(0, (e.coverT || 0) - t)),
    e.vis &&
      e.coverT <= 0 &&
      !e.cover &&
      !BOTW[e.wpn].melee &&
      (e.hp < 45 || (void 0 !== e.mag && e.mag <= 0)) &&
      Math.random() < 2 * t)
  ) {
    const t = e.vis,
      o = V3(t.pos.x, t.pos.y + 1.4, t.pos.z);
    let n = null,
      a = 1e9;
    for (const r of LV.wps) {
      const s = Math.hypot(r.x - e.pos.x, r.z - e.pos.z);
      s < 2 ||
        s > 14 ||
        Math.hypot(r.x - t.pos.x, r.z - t.pos.z) < s ||
        losClear(V3(r.x, r.y + 1.2, r.z), o, !0) ||
        (s < a && ((a = s), (n = r)));
    }
    n ? ((e.cover = V3(n.x, n.y, n.z)), (e.coverHold = rand(1.5, 3)), (e.coverGo = 4)) : (e.coverT = 2);
  }
  if (e.cover) {
    const o = Math.hypot(e.cover.x - e.pos.x, e.cover.z - e.pos.z);
    if (((e.coverGo -= t), e.coverGo <= 0 || e.stuck > 1)) ((e.cover = null), (e.coverT = rand(3, 5)));
    else if (o > 0.8) {
      e.mv = botMoveDir(e, e.cover);
      const o = yawTo(e.mv.x, e.mv.z);
      ((e.yaw += clamp(angDiff(e.yaw, o) * Math.min(1, 6 * t), -4 * t, 4 * t)), (r = 4.2));
    } else
      ((e.mv = V3()),
        (e.crW = !0),
        (e.coverHold -= t),
        e.hp < 100 && (e.hp = Math.min(100, e.hp + 12 * t)),
        e.coverHold <= 0 && ((e.cover = null), (e.coverT = rand(4, 7)), (e.crW = !1)));
  } else if (e.vis) {
    const n = e.vis;
    ((e.seeT += t), (e.aware = 7), (e.lastKnown = n.pos.clone()));
    const a = n.pos.x - e.pos.x,
      s = n.pos.z - e.pos.z,
      l = Math.hypot(a, s),
      i = yawTo(a, s);
    ((e.yaw += clamp(angDiff(e.yaw, i) * Math.min(1, 7 * t), -4.5 * t, 4.5 * t)),
      (e.aimPitch = Math.atan2(n.pos.y + 1.25 - 0.4 * n.cr - (e.pos.y + 1.45 - 0.45 * e.cr), Math.max(l, 0.5))),
      (e.strafeT -= t),
      e.strafeT <= 0 &&
        ((e.strafe = [-1, 1, 0, -1, 1][(5 * Math.random()) | 0]),
        (e.strafeT = rand(0.6, 1.8)),
        (e.crW = Math.random() < 0.25)));
    const c = BOTW[e.wpn].pref || [7, 22],
      d = V3(a / l, 0, s / l),
      u = V3(-d.z, 0, d.x),
      p = V3().addScaledVector(u, e.strafe * (BOTW[e.wpn].melee ? 0.2 : 0.8));
    if (
      (l > c[1] ? p.add(d).add(d) : l < c[0] && p.addScaledVector(d, -0.6),
      BOTW[e.wpn].melee &&
        l > 1.4 &&
        (losClear(o, V3(n.pos.x, n.pos.y + 1, n.pos.z), !1) || p.copy(botMoveDir(e, n.pos)), (e.crW = !1)),
      (e.mv = p),
      (r = BOTW[e.wpn].melee ? 4.6 : e.crW ? 1.6 : 2.8),
      e.seeT > e.react && Math.abs(angDiff(e.yaw, i)) < 0.22 && ((e.fireT -= t), e.fireT <= 0))
    ) {
      const t = BOTW[e.wpn];
      l > t.range ||
        (e.burst <= 0 && (e.burst = t.burst[0] + ((Math.random() * (t.burst[1] - t.burst[0] + 1)) | 0)),
        botFire(e, n, l),
        e.burst--,
        (e.fireT = e.burst > 0 ? t.int : rand(0.45, 1.1) + t.pause));
    }
  } else {
    if (((e.seeT = Math.max(0, e.seeT - 1.5 * t)), (e.aware -= t), (e.crW = !1), e.holdT > 0))
      ((e.holdT -= t), (e.yaw += Math.sin(1.3 * G.t + e.i) * t * 0.9), (r = 0), (e.mv = V3()));
    else if (e.lastKnown && e.aware > 0) {
      a = e.lastKnown;
      const t = Math.hypot(a.x - e.pos.x, a.z - e.pos.z);
      ((r = t > 12 ? 3.8 : 2.2),
        (e.crW = (t < 8 && Math.random() < 0.002) || e.crW),
        t < 1.5 && ((e.lastKnown = null), (e.investigate = !1), (e.holdT = rand(1.2, 2.5))));
    } else
      ((e.patrolGoal < 0 ||
        e.patrolGoal >= LV.wps.length ||
        Math.hypot(LV.wps[e.patrolGoal].x - e.pos.x, LV.wps[e.patrolGoal].z - e.pos.z) < 1.5 ||
        e.stuck > 2) &&
        (e.patrolGoal >= 0 && Math.random() < 0.45 && (e.holdT = rand(0.8, 2.2)),
        (e.patrolGoal = pickPatrol(e)),
        (e.stuck = 0),
        (e.path = [])),
        (a = LV.wps[e.patrolGoal]),
        (r = e.hunt ? 2.8 : 2.1));
    if (a) {
      e.mv = botMoveDir(e, a);
      const o = yawTo(e.mv.x, e.mv.z);
      e.mv.lengthSq() > 0.01 && (e.yaw += clamp(angDiff(e.yaw, o) * Math.min(1, 4 * t), -3 * t, 3 * t));
    }
  }
  const s = e.mv || V3();
  s.lengthSq() > 1e-4 && s.normalize();
  const l = e.pos.clone();
  e.vel || (e.vel = V3());
  const i = Math.min(1, t * (r > 0.1 ? 5 : 8));
  ((e.vel.x += (s.x * r - e.vel.x) * i),
    (e.vel.z += (s.z * r - e.vel.z) * i),
    (e.pos.x += e.vel.x * t),
    (e.pos.z += e.vel.z * t),
    collide(e.pos, 0.32, 1.7));
  const c = groundAt(e.pos.x, e.pos.z, e.pos.y);
  e.pos.y = c > e.pos.y ? lerp(e.pos.y, c, Math.min(1, 15 * t)) : Math.max(c, e.pos.y - 8 * t);
  const d = Math.hypot(e.pos.x - l.x, e.pos.z - l.z);
  ((e.spd = lerp(e.spd, d / t, 0.3)),
    r > 0 && d < r * t * 0.25 ? (e.stuck += t) : (e.stuck = Math.max(0, e.stuck - t)),
    e.stuck > 1.2 &&
      !e.vis &&
      ((e.path = []), (e.repath = 0), (e.directT = 0), e.stuck > 2.5 && ((e.lastKnown = null), (e.patrolGoal = -1))),
    e.vpos.copy(e.pos),
    (e.vyaw = e.yaw),
    (e.vcr = e.cr));
}
function botFire(e, t, o) {
  if (BOTW[e.wpn].melee) {
    if (o > 1.9) return;
    const n = V3(t.pos.x, t.pos.y + 1.1, t.pos.z);
    return (
      sndSwish(),
      bloodFX(n, V3(t.pos.x - e.pos.x, 0, t.pos.z - e.pos.z).normalize()),
      void queueShot('b' + e.i, e.name, {
        o: arr(V3(e.pos.x, e.pos.y + 1.3, e.pos.z)),
        e: arr(n),
        w: 'knife',
        h: [[t.to, t.id || 0, 100, 0]],
        sf: 'flesh'
      })
    );
  }
  const n = V3(-Math.sin(e.yaw), 0, -Math.cos(e.yaw)),
    a = V3(e.pos.x, e.pos.y + 1.42 - 0.45 * e.cr, e.pos.z).addScaledVector(n, 0.6),
    r = V3(t.pos.x, t.pos.y + 1.25 - 0.4 * t.cr, t.pos.z),
    s = 'dmr' === e.wpn || 'sniper' === e.wpn,
    l = clamp(
      (s ? 0.68 : 0.6) -
        o * (s ? 0.004 : 0.009) -
        (t.moving ? 0.16 : 0) -
        (t.cr > 0.5 ? 0.1 : 0) +
        0.05 * Math.min(e.seeT, 3),
      0.06,
      0.62
    ),
    i = Math.random() < l;
  let c,
    d = [],
    u = 'flesh';
  if (i) {
    c = r.clone().add(V3(rand(-0.15, 0.15), rand(-0.2, 0.3), rand(-0.15, 0.15)));
    const n = Math.random() < 0.06,
      a = BOTW[e.wpn];
    d = [
      [
        t.to,
        t.id || 0,
        Math.round(rand(a.dmg[0], a.dmg[1]) * ('shotgun' === e.wpn ? clamp(1.3 - o / 18, 0.25, 1) : 1) * (n ? 6 : 1)),
        n ? 1 : 0
      ]
    ];
  } else {
    const e = r
        .clone()
        .add(V3(rand(-1.4, 1.4), rand(-1, 1.2), rand(-1.4, 1.4)))
        .sub(a)
        .normalize(),
      t = rayWorld(a, e, 200);
    ((c = t ? t.p.clone() : a.clone().addScaledVector(e, 200)),
      (u = t ? t.surf : 'concrete'),
      t && impactFX(t.p, t.n, t.surf));
  }
  (e.model.muzzle.getWorldPosition(a),
    sndGun(BOTW[e.wpn].snd, a, !1),
    muzzleSprite(a, 0.4),
    muzzleLight(a, 30),
    Math.random() < 0.5 && tracer(a, c),
    G.reveal.set('b' + e.i, { p: a.clone(), t: G.t }));
  const p = camera.position,
    m = V3().subVectors(c, a),
    h = m.length();
  if (h > 1) {
    const e = clamp(V3().subVectors(p, a).dot(m) / (h * h), 0, 1),
      t = V3().copy(a).addScaledVector(m, e);
    t.distanceTo(p) < 2.6 && !i && sndWhiz(t);
  }
  queueShot('b' + e.i, e.name, { o: arr(a), e: arr(c), w: BOTW[e.wpn].snd, h: d, sf: u });
}
function updateBots(e) {
  for (const t of BOTS) {
    if (NET.host)
      (!t.ready &&
        t.net &&
        (t.pos.set(t.net[0], t.net[1], t.net[2]), (t.ready = !0), (t.alive = !!t.net[4]), (t.hp = 100)),
        (CURBOT = t),
        t.ready ? botThink(t, e) : ((t.respawn -= e), t.respawn <= 0 && botSpawn(t)),
        (CURBOT = null));
    else if (t.net) {
      const o = t.net;
      t.ready = !0;
      const n = o[7] ? 'A' : 'B',
        a = WLIST[0 | o[6]] || 'rifle';
      ('tdm' === G.gm && n !== t.team && ((t.team = n), makeBotModel(t)), a !== t.wpn && setBotWeapon(t, a));
      const r = V3(o[0], o[1], o[2]);
      t.vpos.distanceTo(r) > 6 && t.vpos.copy(r);
      const s = t.vpos.clone();
      (t.vpos.lerp(r, 1 - Math.exp(10 * -e)),
        (t.spd = lerp(t.spd, t.vpos.distanceTo(s) / e, 0.2)),
        (t.vyaw += angDiff(t.vyaw, o[3]) * Math.min(1, 10 * e)));
      const l = t.alive;
      ((t.alive = !!o[4]),
        l && !t.alive && (t.deadT = 0),
        t.alive || (t.deadT += e),
        (t.vcr = o[5] || 0),
        t.pos.copy(t.vpos),
        (t.yaw = t.vyaw));
    }
    const o = t.model;
    ((o.root.visible = t.ready && (t.alive || t.deadT < 6)),
      o.root.position.copy(t.vpos),
      (o.root.rotation.y = t.vyaw + Math.PI),
      (o.alert = approach(o.alert || 0, t.net ? 0.75 : t.vis ? 1 : t.aware > 0 ? 0.55 : 0, 3 * e)),
      (t.vpitch = lerp(t.vpitch || 0, (t.vis && t.aimPitch) || 0, Math.min(1, 6 * e))),
      animLOD(o, e, t.alive ? t.spd : 0, t.vcr, t.vpitch, t.alive ? 0 : 1),
      t.alive &&
        t.spd > 0.6 &&
        ((t.step += t.spd * e), t.step > 1.5) &&
        ((t.step = 0),
        t.vpos.distanceTo(camera.position) < 30 &&
          sndStep(surfAt(t.vpos.x, t.vpos.z, t.vpos.y), t.vpos.clone().setY(t.vpos.y + 0.1), 1.1, t.spd > 3)));
  }
}
function onStreak(e) {
  if (e.sameTab) return;
  const t = e.data || {},
    o = String(t.n || 'Hostil').slice(0, 24),
    n = 'tdm' === G.gm && ('A' === t.tm || 'B' === t.tm) && t.tm === G.myTeam;
  ('uav' === t.k &&
    (n
      ? ((G.uav = Math.max(G.uav, 30)),
        center('DRON UAV ALIADO', o),
        radio('Dron aliado en el aire. Tenemos ojos sobre el enemigo.'))
      : (center('DRON ENEMIGO', o), radio('Atención. Dron enemigo sobre la zona.'))),
    'turret' === t.k &&
      (center(n ? 'TORRETA ALIADA' : 'TORRETA ENEMIGA', o),
      radio(n ? 'Torreta aliada desplegada.' : 'Torreta hostil desplegada.')),
    'dogs' === t.k &&
      (center(n ? 'PERROS ALIADOS' : 'PERROS ENEMIGOS', o),
      radio(n ? 'Unidad canina aliada en la zona.' : 'Cuidado. Perros sueltos.')));
}
