/* Red: jugadores remotos y salas (solo dentro de Claude) */
function updateRemote(e) {
  const t = new Set();
  for (const e of NET.peers) {
    if (e.sameTab || 'viewer' !== e.kind) continue;
    const o = e.presence || {};
    if (!o.ig) continue;
    t.add(e.peer);
    let n = REMOTE.get(e.peer);
    if (!n) {
      clamp(0 | o.c, 0, 4);
      const t = 'B' === o.tm ? 'B' : 'A',
        a = makeHuman({
          w: WEAPONS[o.w] ? o.w : 'rifle',
          pool: 'tdm' === G.gm ? ('A' === t ? ['sol2'] : ['gas']) : null
        });
      (scene.add(a.root),
        (n = {
          model: a,
          team: t,
          pos: V3(+o.x || 0, +o.y || 0, +o.z || 0),
          tp: V3(),
          yaw: 0,
          alive: !0,
          cr: 0,
          spd: 0,
          step: 0,
          deadT: 0,
          name: '',
          turret: null,
          dogs: []
        }),
        REMOTE.set(e.peer, n));
    }
    (n.tp.set(+o.x || 0, +o.y || 0, +o.z || 0), (n.tyaw = +o.yw || 0), (n.pitch = +o.pt || 0));
    const a = !!o.al;
    (n.alive && !a && (n.deadT = 0),
      (n.alive = a),
      (n.cr = +o.cr || 0),
      (n.name = String(o.n || 'Operador').slice(0, 14)),
      (n.netT = o.t),
      (n.netG = o.g));
    const r = WEAPONS[o.w] ? o.w : 'rifle';
    if (r !== n.wk && n.model.gun) {
      for (let e = n.model.gun.children.length - 1; e >= 0; e--)
        n.model.gun.children[e].userData.wg && n.model.gun.remove(n.model.gun.children[e]);
      const e = worldGun(r);
      ((e.rotation.y = Math.PI), (e.userData.wg = 1), n.model.gun.add(e), setHold(n.model.gripT, n.model.guardT, r));
    }
    n.wk = r;
    const s = 'B' === o.tm ? 'B' : 'A';
    (s !== n.team &&
      ((n.team = s),
      'tdm' === G.gm &&
        (scene.remove(n.model.root),
        (n.model = makeHuman({ w: n.wk, pool: 'A' === s ? ['sol2'] : ['gas'] })),
        scene.add(n.model.root))),
      !1 === NET.host && o.b && (e.peer, NET.hostPeer));
  }
  for (const [o, n] of REMOTE) {
    if (!t.has(o)) {
      (scene.remove(n.model.root),
        n.turret && scene.remove(n.turret.root),
        n.dogs.forEach(e => scene.remove(e.root)),
        REMOTE.delete(o));
      continue;
    }
    n.pos.distanceTo(n.tp) > 6 && n.pos.copy(n.tp);
    const a = n.pos.clone();
    (n.pos.lerp(n.tp, 1 - Math.exp(12 * -e)),
      (n.spd = lerp(n.spd, n.pos.distanceTo(a) / Math.max(e, 0.001), 0.25)),
      (n.yaw = (n.yaw || 0) + angDiff(n.yaw || 0, n.tyaw) * Math.min(1, 14 * e)),
      n.alive || (n.deadT += e));
    const r = n.model;
    ((r.root.visible = n.alive || n.deadT < 5),
      r.root.position.copy(n.pos),
      (r.root.rotation.y = n.yaw + Math.PI),
      (r.alert = 1),
      animLOD(r, e, n.alive ? n.spd : 0, n.cr, n.pitch || 0, n.alive ? 0 : 1),
      n.alive &&
        n.spd > 0.6 &&
        ((n.step += n.spd * e),
        n.step > 1.5 &&
          ((n.step = 0),
          sndStep(surfAt(n.pos.x, n.pos.z, n.pos.y), n.pos.clone().setY(n.pos.y + 0.1), 1.1, n.spd > 4))));
    const s = n.netT;
    Array.isArray(s)
      ? (n.turret || ((n.turret = makeTurret()), scene.add(n.turret.root)),
        n.turret.root.position.set(+s[0], +s[1], +s[2]),
        (n.turret.yaw.rotation.y = +s[3] + Math.PI))
      : n.turret && (scene.remove(n.turret.root), (n.turret = null));
    const l = Array.isArray(n.netG) ? n.netG.slice(0, 3) : [];
    for (; n.dogs.length < l.length;) {
      const e = makeDog();
      (scene.add(e.root), n.dogs.push(e));
    }
    for (; n.dogs.length > l.length;) scene.remove(n.dogs.pop().root);
    l.forEach((t, o) => {
      const a = n.dogs[o],
        r = a.root.position.clone();
      (a.root.position.lerp(V3(+t[0], +t[1], +t[2]), Math.min(1, 10 * e)),
        (a.root.rotation.y = +t[3] + Math.PI),
        animDog(a, e, a.root.position.distanceTo(r) / Math.max(e, 0.001)));
    });
  }
}
function dispatch(e, t) {
  try {
    HANDLERS[e] && HANDLERS[e](t);
  } catch (e) {
    console.warn(e);
  }
}
function netEmit(e, t) {
  NET.online && NET.rm ? NET.rm.emit(e, t).catch(() => {}) : dispatch(e, { data: t, sameTab: !0, isMe: !0 });
}
async function netConnect(e) {
  if (!window.claude || 'function' != typeof window.claude.use)
    throw new Error('El modo online solo funciona dentro de Claude, con el artefacto abierto.');
  const t = await claude.use('room');
  if (!t)
    throw new Error('No se pudo conectar a la sala. Revisa que tu amigo y tú tengáis acceso de edición al artefacto.');
  const o = await t.join('u07-' + e.toLowerCase());
  ((NET.rm = o), (NET.online = !0), (NET.code = e));
  for (const e of Object.keys(HANDLERS))
    o.on(
      e,
      t => dispatch(e, t),
      () => {}
    );
  (o.onPeers(
    e => {
      NET.peers = e.peers;
      for (const t of e.peers) t.isMe && t.sameTab && (NET.me = t.peer);
    },
    () => {}
  ),
    o.onConnection(
      e => {
        NET.connected = e;
      },
      () => {}
    ),
    await new Promise(e => setTimeout(e, 1800)));
  const n = NET.peers.find(e => !e.sameTab && e.presence && e.presence.ig && MAPS[e.presence.m]);
  return (
    n && MODES[n.presence.gm] && (G.gm = n.presence.gm),
    n && TODS[n.presence.td] && (G.tod = n.presence.td),
    !n || ('full' !== n.presence.hx && 'extreme' !== n.presence.hx) || (G.hud = n.presence.hx),
    n ? n.presence.m : null
  );
}
function netTick(e) {
  if (!NET.online) return;
  const t = NET.peers
      .filter(e => 'viewer' === e.kind && (e.sameTab || (e.presence && e.presence.ig)))
      .map(e => e.peer)
      .sort(),
    o = NET.hostId || t[0] || NET.me,
    n = NET.host;
  if (((NET.host = o === NET.me), (NET.hostPeer = o), NET.host)) {
    if (!n)
      for (const e of BOTS)
        ((e.ready = !!e.net), e.net && (e.pos.copy(e.vpos), (e.alive = !!e.net[4]), (e.hp = 100), (e.respawn = 2)));
  } else {
    const e = NET.peers.find(e => e.peer === o),
      t = e && e.presence && Array.isArray(e.presence.b) ? e.presence.b : null;
    (t &&
      (t.length !== BOTS.length && makeBots(t.length),
      BOTS.forEach((e, o) => {
        Array.isArray(t[o]) && (e.net = t[o].map(Number));
      })),
      e && e.presence && 'number' == typeof e.presence.wt && (G.warm = e.presence.wt));
  }
  if (((NET.flushT -= e), NET.flushT <= 0 && ((NET.flushT = 0.1), flushShots()), (NET.sendT -= e), NET.sendT <= 0)) {
    NET.sendT = 1 / 15;
    const e = {
      ig: 1,
      n: G.name,
      c: G.cls,
      w: P.w.key,
      m: G.map,
      gm: G.gm,
      hx: G.hud,
      td: G.tod,
      tm: G.myTeam,
      wt: NET.host ? r2(G.warm) : null,
      x: r2(P.pos.x),
      y: r2(P.pos.y),
      z: r2(P.pos.z),
      yw: r2(P.yaw),
      pt: r2(P.pitch),
      al: P.alive ? 1 : 0,
      cr: r2(P.crouch),
      t: MY.turret ? [r2(MY.turret.pos.x), r2(MY.turret.pos.y), r2(MY.turret.pos.z), r2(MY.turret.yaw)] : null,
      g: MY.dogs.length ? MY.dogs.map(e => [r2(e.pos.x), r2(e.pos.y), r2(e.pos.z), r2(e.yaw)]) : null,
      b: NET.host
        ? BOTS.map(e => [
            r2(e.vpos.x),
            r2(e.vpos.y),
            r2(e.vpos.z),
            r2(e.vyaw),
            e.alive ? 1 : 0,
            r2(e.vcr),
            WLIST.indexOf(e.wpn),
            'A' === e.team ? 1 : 0
          ])
        : null
    };
    NET.rm.presence(e).catch(() => {});
  }
  const a = NET.peers.filter(e => 'viewer' === e.kind && e.presence && e.presence.ig).length;
  $('#netTxt').textContent =
    `Sala ${NET.code} · ${Math.max(1, a)} ${1 === a ? 'operador' : 'operadores'}${NET.host ? ' · anfitrión' : ''}`;
}

// Mensajes de red → función que los atiende (antes estaba junto al estado, en 30-state.js).
const HANDLERS = { shot: onShot, kill: onKill, nade: onNade, streak: onStreak };
