/* Minas, granadas, habilidades, rachas y botín */
function enemyTargets() {
  const e = [];
  for (const t of BOTS)
    t.alive && t.ready && !sameTeam(NET.me, 'b' + t.i) && e.push({ to: 'b', id: t.i, pos: t.vpos, cr: t.vcr });
  for (const [t, o] of REMOTE) o.alive && !sameTeam(NET.me, t) && e.push({ to: t, id: 0, pos: o.pos, cr: o.cr });
  return e;
}
function updateMine(e) {
  const t = MY.turret;
  if (t)
    if (((t.t -= e), t.t <= 0)) (scene.remove(t.model.root), (MY.turret = null));
    else {
      const o = V3(t.pos.x, t.pos.y + 0.83, t.pos.z);
      if (((t.losT -= e), t.losT <= 0)) {
        ((t.losT = 0.25), (t.target = null));
        let e = 48;
        for (const n of enemyTargets()) {
          const a = n.pos.distanceTo(t.pos);
          a < e && losClear(o, V3(n.pos.x, n.pos.y + 1.2, n.pos.z)) && ((e = a), (t.target = n));
        }
      }
      if (t.target) {
        const n = t.target,
          a = yawTo(n.pos.x - t.pos.x, n.pos.z - t.pos.z),
          r = angDiff(t.yaw, a);
        if (((t.yaw += clamp(r, -3 * e, 3 * e)), (t.fireT -= e), Math.abs(r) < 0.08 && t.fireT <= 0)) {
          t.fireT = 0.13;
          const e = n.pos.distanceTo(t.pos),
            a = Math.random() < clamp(0.55 - 0.006 * e, 0.15, 0.55),
            r = V3(n.pos.x, n.pos.y + 1.2 - 0.4 * n.cr, n.pos.z),
            s = V3(-Math.sin(t.yaw), 0, -Math.cos(t.yaw)),
            l = o.clone().addScaledVector(s, 0.9);
          let i,
            c = 'flesh',
            d = [];
          if (a) ((i = r), (d = [[n.to, n.id, 13, 0]]), bloodFX(r, s));
          else {
            const e = r
                .clone()
                .add(V3(rand(-1, 1), rand(-0.6, 0.8), rand(-1, 1)))
                .sub(l)
                .normalize(),
              t = rayWorld(l, e, 120);
            ((i = t ? t.p.clone() : l.clone().addScaledVector(e, 120)),
              (c = t ? t.surf : 'concrete'),
              t && impactFX(t.p, t.n, t.surf));
          }
          (sndGun('turret', l, !1),
            muzzleSprite(l, 0.35),
            muzzleLight(l, 25),
            tracer(l, i),
            queueShot(NET.me, G.name, { o: arr(l), e: arr(i), w: 'turret', h: d, sf: c }));
        }
      } else t.yaw += 0.4 * e;
      t.model.yaw.rotation.y = t.yaw + Math.PI;
    }
  for (let t = MY.dogs.length - 1; t >= 0; t--) {
    const o = MY.dogs[t];
    if (((o.t -= e), o.t <= 0)) {
      (scene.remove(o.model.root), MY.dogs.splice(t, 1));
      continue;
    }
    let n = 1e9;
    o.target = null;
    for (const e of enemyTargets()) {
      const t = e.pos.distanceTo(o.pos);
      t < n && ((n = t), (o.target = e));
    }
    let a = V3(),
      r = 0;
    if (o.target) {
      const t = o.target,
        n = Math.hypot(t.pos.x - o.pos.x, t.pos.z - o.pos.z);
      if (
        (n > 1.2 && ((o.repath = (o.repath || 0) - e), (a = botMoveDir(o, t.pos)), (r = 7.2)),
        (o.biteT -= e),
        n < 1.5 && Math.abs(t.pos.y - o.pos.y) < 1.2 && o.biteT <= 0)
      ) {
        o.biteT = 0.85;
        const e = V3(t.pos.x, t.pos.y + 0.9, t.pos.z);
        (sndGrowl(o.pos),
          bloodFX(e, V3(t.pos.x - o.pos.x, 0, t.pos.z - o.pos.z).normalize()),
          queueShot(NET.me, G.name, {
            o: arr(V3(o.pos.x, o.pos.y + 0.6, o.pos.z)),
            e: arr(e),
            w: 'dog',
            h: [[t.to, t.id, 40, 0]],
            sf: 'flesh'
          }));
      }
    }
    a.lengthSq() > 0.001 && (a.normalize(), (o.yaw += clamp(angDiff(o.yaw, yawTo(a.x, a.z)), -8 * e, 8 * e)));
    const s = o.pos.clone();
    ((o.pos.x += a.x * r * e), (o.pos.z += a.z * r * e), collide(o.pos, 0.3, 0.9));
    const l = groundAt(o.pos.x, o.pos.z, o.pos.y);
    ((o.pos.y = l > o.pos.y ? lerp(o.pos.y, l, Math.min(1, 15 * e)) : Math.max(l, o.pos.y - 8 * e)),
      (o.spd = lerp(o.spd, o.pos.distanceTo(s) / e, 0.3)),
      o.model.root.position.copy(o.pos),
      (o.model.root.rotation.y = o.yaw + Math.PI),
      animDog(o.model, e, o.spd),
      (o.barkT -= e),
      o.barkT <= 0 && ((o.barkT = rand(2, 5)), sndBark(o.pos.clone().setY(o.pos.y + 0.6))));
  }
}
function throwNade(e) {
  camera.updateMatrixWorld();
  const t = V3(0, 0, -1).applyQuaternion(camera.quaternion),
    o = V3().copy(camera.position).addScaledVector(t, 0.5),
    n = t
      .multiplyScalar(15)
      .add(V3(0, 2.5, 0))
      .add(V3(P.vel.x, 0, P.vel.z));
  netEmit('nade', { k: e, o: arr(o), v: arr(n), by: NET.me, n: G.name });
}
function onNade(e) {
  const t = e.data;
  if (!t || !Array.isArray(t.o) || !Array.isArray(t.v)) return;
  const o = 'flash' === t.k ? 'flash' : 'frag',
    n = new THREE.Mesh(nadeGeo, M('flash' === o ? 'gunmetal' : 'rust'));
  ((n.castShadow = !0),
    scene.add(n),
    NADES.push({
      k: o,
      pos: vec(t.o),
      vel: vec(t.v),
      fuse: 'frag' === o ? 2.2 : 1.5,
      by: String(t.by || ''),
      n: String(t.n || '?').slice(0, 24),
      mesh: n
    }));
}
function updateNades(e) {
  for (let t = NADES.length - 1; t >= 0; t--) {
    const o = NADES[t];
    ((o.fuse -= e), (o.vel.y -= 14 * e));
    const n = V3().copy(o.vel).multiplyScalar(e),
      a = n.length();
    if (a > 1e-4) {
      const e = n.clone().divideScalar(a),
        t = rayWorld(o.pos, e, a + 0.04, !1);
      if (t) {
        o.pos.copy(t.p).addScaledVector(t.n, 0.05);
        const e = o.vel.dot(t.n);
        (o.vel.addScaledVector(t.n, -2 * e).multiplyScalar(0.38), Math.abs(e) > 1.5 && sndBounce(o.pos));
      } else o.pos.add(n);
    }
    const r = groundAt(o.pos.x, o.pos.z, o.pos.y);
    (o.pos.y < r + 0.04 &&
      ((o.pos.y = r + 0.04),
      o.vel.y < 0 && (o.vel.y < -2 && sndBounce(o.pos), (o.vel.y *= -0.3), (o.vel.x *= 0.6), (o.vel.z *= 0.6))),
      o.mesh.position.copy(o.pos),
      (o.mesh.rotation.x += 8 * e),
      o.fuse <= 0 && (scene.remove(o.mesh), NADES.splice(t, 1), explode(o)));
  }
}
function explode(e) {
  const t = e.pos.clone(),
    o = V3(t.x, t.y + 0.3, t.z);
  (sndBoom(t, 'flash' === e.k),
    muzzleLight(t, 'flash' === e.k ? 900 : 500),
    muzzleSprite(t, 'flash' === e.k ? 2.5 : 3.5));
  for (let o = 0; o < ('flash' === e.k ? 6 : 14); o++)
    particle(SPR.smoke, t, V3(rand(-3, 3), rand(0.5, 4), rand(-3, 3)), {
      color: 'flash' === e.k ? 14540253 : 4867392,
      life: rand(2, 4),
      size: 0.6,
      grow: rand(2.5, 4),
      op: 0.55,
      drag: 2.2,
      g: -0.3
    });
  if ('frag' === e.k)
    for (let e = 0; e < 16; e++)
      particle(SPR.spark, t, V3(rand(-9, 9), rand(2, 10), rand(-9, 9)), {
        add: 1,
        life: rand(0.2, 0.5),
        size: 0.06,
        grow: 0.02,
        op: 1,
        g: 9,
        drag: 0.6
      });
  const n = V3(P.pos.x, P.pos.y + 1.2, P.pos.z),
    a = n.distanceTo(t);
  if (((G.shake = Math.min(1, G.shake + clamp(1 - a / 25, 0, 1) * ('frag' === e.k ? 0.9 : 0.4))), 'frag' === e.k)) {
    if (
      (P.alive &&
        a < 9 &&
        losClear(o, n) &&
        (damageMe(140 * Math.pow(1 - a / 9, 1.3), e.by, e.n, t, 'frag'), a < 7 && sndTinnitus(1 - a / 7)),
      NET.host)
    )
      for (const n of BOTS) {
        if (!n.alive) continue;
        const a = V3(n.pos.x, n.pos.y + 1.1, n.pos.z),
          r = a.distanceTo(t);
        r < 9 && losClear(o, a) && damageBot(n.i, 140 * Math.pow(1 - r / 9, 1.3), e.by, e.n, !1, 'frag');
      }
    addDecal(FX.holes, 'holeI', V3(t.x, groundAt(t.x, t.z, t.y) + 0.01, t.z), V3(0, 1, 0), 1.6);
  } else {
    if (P.alive && a < 18 && losClear(o, n)) {
      const e = V3(0, 0, -1).applyQuaternion(camera.quaternion).dot(V3().subVectors(t, camera.position).normalize()),
        o = clamp((1 - a / 18) * (0.35 + 0.65 * Math.max(0, e)), 0, 1);
      ((G.flash = Math.max(G.flash, 4.5 * o)), sndTinnitus(o));
    }
    if (NET.host)
      for (const e of BOTS) {
        if (!e.alive) continue;
        const n = V3(e.pos.x, e.pos.y + 1.5, e.pos.z),
          a = n.distanceTo(t);
        a < 15 && losClear(o, n) && (e.blind = Math.max(e.blind, 4 * (1 - a / 15) + 1));
      }
  }
}
function useAbility() {
  if (!P.alive || G.abCD > 0 || G.paused || 'gun' === G.gm) return;
  const e = CLASSES[G.cls].ab[G.ab];
  switch (((G.abCD = e.cd), sndAbility(), e.id)) {
    case 'stim':
      ((P.hp = Math.min(100, P.hp + 40)), (G.stimT = 6), sndInject());
      break;
    case 'frag':
    case 'flash':
      throwNade(e.id);
      break;
    case 'pulse':
      ((G.pulse = 6), sndRadio());
      break;
    case 'thermal':
      G.thermal = 10;
      break;
    case 'plate':
      ((P.armor = 60), click(AU.ctx ? AU.ctx.currentTime : 0, 900, 0.08, 0.6));
      break;
    case 'regen':
      ((G.regenT = 8), sndInject());
      break;
    case 'medkit':
      ((P.hp = 100), sndInject());
      break;
    case 'nvg':
      ((G.nvg = 15), sndRadio());
      break;
    case 'sensor':
      G.sensor = 10;
  }
}
function checkStreak() {
  if ('gun' === G.gm) return void updateStreakHud();
  const e = G.streak;
  (3 !== e || G.earned.uav || ((G.earned.uav = 1), center('DRON UAV DISPONIBLE', 'Pulsa 4')),
    6 !== e || G.earned.turret || ((G.earned.turret = 1), center('TORRETA DISPONIBLE', 'Pulsa 5')),
    10 === e && (G.earned.dogs || ((G.earned.dogs = 1), center('UNIDAD CANINA DISPONIBLE', 'Pulsa 6')), (G.streak = 0)),
    e >= 3 && AU.ctx && sndRadio(),
    updateStreakHud());
}
function updateStreakHud() {
  hudKit();
}
function deployStreak(e) {
  if (P.alive && !G.paused && G.earned[e]) {
    if (
      ((G.earned[e] = 0),
      'uav' === e &&
        ((G.uav = 30),
        center('DRON UAV EN LÍNEA', ''),
        radio('Dron de reconocimiento en el aire.'),
        netEmit('streak', { k: 'uav', n: G.name, tm: G.myTeam })),
      'turret' === e)
    ) {
      const e = V3(-Math.sin(P.yaw), 0, -Math.cos(P.yaw));
      let t = V3().copy(P.pos).addScaledVector(e, 2.2);
      (losClear(V3(P.pos.x, P.pos.y + 1, P.pos.z), V3(t.x, P.pos.y + 1, t.z), !1) ||
        (t = V3().copy(P.pos).addScaledVector(e, 0.9)),
        (t.y = groundAt(t.x, t.z, P.pos.y + 0.3)),
        MY.turret && scene.remove(MY.turret.model.root));
      const o = makeTurret();
      (o.root.position.copy(t),
        scene.add(o.root),
        (MY.turret = { pos: t, yaw: P.yaw, t: 45, fireT: 0, losT: 0, target: null, model: o }),
        center('TORRETA DESPLEGADA', ''),
        radio('Torreta automática desplegada.'),
        netEmit('streak', { k: 'turret', n: G.name, tm: G.myTeam }));
    }
    if ('dogs' === e) {
      for (const e of MY.dogs) scene.remove(e.model.root);
      MY.dogs = [];
      for (let e = 0; e < 3; e++) {
        const t = P.yaw + 0.9 * (e - 1),
          o = V3(P.pos.x - 1.5 * Math.sin(t), 0, P.pos.z - 1.5 * Math.cos(t));
        (collide(o, 0.3, 1), (o.y = groundAt(o.x, o.z, P.pos.y + 0.3)));
        const n = makeDog();
        (n.root.position.copy(o),
          scene.add(n.root),
          MY.dogs.push({
            pos: o,
            yaw: P.yaw,
            t: 45,
            model: n,
            target: null,
            biteT: 0,
            barkT: rand(1, 3),
            path: [],
            repath: 0,
            spd: 0,
            stuck: 0
          }));
      }
      (center('UNIDAD CANINA', ''),
        radio('Unidad canina liberada. Que no escape nadie.'),
        netEmit('streak', { k: 'dogs', n: G.name, tm: G.myTeam }),
        MY.dogs.forEach(e => sndBark(e.pos)));
    }
    updateStreakHud();
  }
}
function spawnDrop(e, t) {
  if (!WEAPONS[e] || !t) return;
  const o = worldGun(e),
    n = new THREE.Group();
  (n.add(o), o.rotation.set(0, 0, Math.PI / 2));
  const a = groundAt(t.x, t.z, t.y + 0.3);
  for (
    n.position.set(t.x + rand(-0.3, 0.3), a + 0.035, t.z + rand(-0.3, 0.3)),
      n.rotation.y = rand(0, TAU),
      scene.add(n),
      DROPS.push({ key: e, g: n, t: 45 });
    DROPS.length > 12;
  )
    scene.remove(DROPS.shift().g);
}
function nearDrop() {
  let e = null,
    t = 1.7;
  for (const o of DROPS) {
    if (o.key === P.primary || 'pistol' === o.key) continue;
    const n = Math.hypot(o.g.position.x - P.pos.x, o.g.position.z - P.pos.z);
    n < t && Math.abs(o.g.position.y - P.pos.y) < 1.2 && o.key !== P.w.key && ((t = n), (e = o));
  }
  return e;
}
function tryPickup() {
  if (!P.alive || G.paused || 'gun' === G.gm) return;
  const e = nearDrop();
  if (!e) return;
  const t = P.w.key;
  (scene.remove(e.g),
    DROPS.splice(DROPS.indexOf(e), 1),
    ['pistol', 'knife'].includes(t) || spawnDrop(t, P.pos),
    (P.primary = e.key),
    (P.slot = 0),
    setupLoadout(e.key),
    (P.res = Math.round(0.5 * P.w.res)),
    click(AU.ctx ? AU.ctx.currentTime : 0, 1200, 0.05, 0.6),
    sndReload(P.w));
}
function updateDrops(e) {
  for (let t = DROPS.length - 1; t >= 0; t--) {
    const o = DROPS[t];
    if (((o.t -= e), o.t <= 0)) (scene.remove(o.g), DROPS.splice(t, 1));
    else if (
      P.alive &&
      'gun' !== G.gm &&
      Math.hypot(o.g.position.x - P.pos.x, o.g.position.z - P.pos.z) < 1.2 &&
      Math.abs(o.g.position.y - P.pos.y) < 1.2
    ) {
      const e = o.key;
      if ((e === P.w.key || e === P.primary || 'pistol' === e) && WEAPONS[e].mag) {
        if (e === P.w.key) P.res += WEAPONS[e].mag;
        else {
          const t = P.mags[e] || { ammo: WEAPONS[e].mag, res: WEAPONS[e].res };
          ((t.res += WEAPONS[e].mag), (P.mags[e] = t));
        }
        (scene.remove(o.g),
          DROPS.splice(t, 1),
          center('+' + WEAPONS[e].mag + ' MUNICIÓN', WEAPONS[e].name),
          AU.ctx && click(AU.ctx.currentTime, 1500, 0.04, 0.5));
      }
    }
  }
  const t = P.alive ? nearDrop() : null,
    o = $('#prompt');
  t
    ? ((o.hidden = !1),
      (o.innerHTML = ('touch' === G.input ? 'Toca para recoger ' : kbd('pickup') + ' Recoger ') + WEAPONS[t.key].name))
    : (o.hidden = !0);
}
