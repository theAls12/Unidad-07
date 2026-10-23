/* Jugador: equipamiento, aparición, movimiento, cámara y arma */
function setupLoadout(e) {
  VM.root && camera.remove(VM.root);
  const t = CLASSES[G.cls],
    o = WEAPONS[e || t.w];
  ((P.w = o),
    (P.ammo = o.mag),
    (P.res = o.res),
    (P.reload = 0),
    (P.bolt = 0),
    (P.ads = 0),
    (VM.root = new THREE.Group()),
    camera.add(VM.root),
    (VM.gun = buildGun(o.key)),
    VM.root.add(VM.gun.g),
    (VM.arms = buildArms(VM.gun.g, SUITS[G.cls][0], o.key)),
    VM.root.traverse(e => e.layers.set(1)),
    FLASH ||
      ((FLASH = new THREE.SpotLight(16773596, 0, 46, 0.5, 0.65, 2)),
      FLASH.position.set(0.08, -0.12, -1.25),
      FLASH.target.position.set(0.03, -0.08, -5),
      camera.add(FLASH, FLASH.target),
      (FLASH.castShadow = !0),
      FLASH.shadow.mapSize.set(Q.fs, Q.fs),
      (FLASH.shadow.camera.near = 0.2),
      (FLASH.shadow.camera.far = 40),
      (FLASH.shadow.bias = -6e-4),
      FLASH.layers.enableAll()));
}
function enemyPositions() {
  const e = [];
  for (const t of BOTS) t.alive && e.push(t.vpos);
  for (const t of REMOTE.values()) t.alive && e.push(t.pos);
  return e;
}
function pickSpawn(e) {
  const t = LV.spawns.map(([t, o]) => {
    let n = 1e9;
    for (const a of e) n = Math.min(n, Math.hypot(a.x - t, a.z - o));
    return { x: t, z: o, m: n + 8 * Math.random() };
  });
  t.sort((e, t) => t.m - e.m);
  const o = t[Math.floor(Math.random() * Math.min(3, t.length))],
    n = LV.terrain ? LV.terrain(o.x, o.z) + 0.3 : 0.3;
  return V3(o.x, groundAt(o.x, o.z, n), o.z);
}
function respawn() {
  if (null != G.nextCls) {
    ((G.cls = G.nextCls), (G.ab = G.nextAb || 0), (G.nextCls = null), (G.abCD = 0));
    try {
      savePrefs();
    } catch (e) {}
    $('#nextCls').textContent = '';
  }
  ((P.mags = {}),
    (P.primary = 'gun' === G.gm ? GG[ggLevel()] : CLASSES[G.cls].w),
    (P.slot = 0),
    setupLoadout(P.primary),
    (VM.cls = G.cls));
  const e = pickSpawn(enemyPositions());
  (P.pos.copy(e),
    P.vel.set(0, 0, 0),
    (P.yaw = yawTo(-e.x, -e.z) + rand(-0.6, 0.6)),
    (P.pitch = 0),
    (P.hp = 100),
    (P.armor = 0),
    (P.alive = !0),
    (P.reload = 0),
    (P.deathT = 0),
    (G.dmg = 0),
    (G.flash = 0),
    ($('#death').hidden = !0),
    (G.stimT = G.regenT = G.thermal = G.nvg = 0));
}
function updatePlayer(e) {
  if (!P.alive) return ((P.deathT += e), (P.respawn -= e), void (P.respawn <= 0 && respawn()));
  const t = G.paused ? 0 : 1,
    o = 0.0022 * lerp(1, P.w.fov / 74, P.ads);
  ((P.yaw -= MOUSE.dx * o * t),
    (P.pitch = clamp(P.pitch - MOUSE.dy * o * t, -1.45, 1.45)),
    (MOUSE.sdx = MOUSE.dx),
    (MOUSE.sdy = MOUSE.dy),
    (MOUSE.dx = MOUSE.dy = 0));
  const n = G.paused ? {} : KEYS,
    a = !G.paused && (PAD.mx || PAD.my),
    r = clamp((n.KeyW ? 1 : 0) - (n.KeyS ? 1 : 0) - (a ? PAD.my : 0), -1, 1),
    s = clamp((n.KeyD ? 1 : 0) - (n.KeyA ? 1 : 0) + (a ? PAD.mx : 0), -1, 1),
    l = Math.min(1, Math.hypot(r, s)),
    i = n.KeyC || n.ControlLeft || n.ControlRight || (!G.paused && PAD.crouch);
  if (((P.crouch = approach(P.crouch, i ? 1 : 0, 6 * e)), i && P.crouch < 1 && V3().copy(P.pos), !i && P.crouch > 0))
    for (const e of boxesAt(P.pos.x, P.pos.z, 0.35))
      if (e.min[1] > P.pos.y + 1.1 && e.min[1] < P.pos.y + 1.8 && inBoxXZ(e, P.pos.x, P.pos.z, 0.3)) {
        P.crouch = Math.max(P.crouch, 0.9);
        break;
      }
  ((P.sprint = (!!n.ShiftLeft || (!G.paused && PAD.sprint)) && r > 0.5 && P.ads < 0.3 && P.crouch < 0.5 && !MOUSE.l),
    (P.sprintK = approach(P.sprintK, P.sprint ? 1 : 0, 5 * e)),
    P.sprint && P.reload > 0 && P.w.shell);
  let c = P.sprint ? 5.9 : 3.7;
  (P.crouch > 0.5 && (c = 1.9),
    (c *= lerp(1, 0.62, P.ads)),
    G.stimT > 0 && (c *= 1.25),
    'smg' === CLASSES[G.cls].w && (c *= 1.06));
  const d = V3(-Math.sin(P.yaw), 0, -Math.cos(P.yaw)),
    u = V3(Math.cos(P.yaw), 0, -Math.sin(P.yaw)),
    p = V3().addScaledVector(d, r).addScaledVector(u, s);
  p.lengthSq() > 0 && p.normalize().multiplyScalar(c * l);
  const m = P.ground ? 11 : 2.2;
  ((P.vel.x += (p.x - P.vel.x) * Math.min(1, m * e)),
    (P.vel.z += (p.z - P.vel.z) * Math.min(1, m * e)),
    n.Space && P.ground && P.crouch < 0.5 && ((P.vel.y = 5.3), (P.ground = !1), (KEYS.Space = !1)),
    (P.pos.x += P.vel.x * e),
    (P.pos.z += P.vel.z * e),
    collide(P.pos, 0.32, 1.75 - 0.65 * P.crouch));
  const h = groundAt(P.pos.x, P.pos.z, P.pos.y);
  P.ground && P.vel.y <= 0 && h > P.pos.y - 0.4
    ? ((P.pos.y = h > P.pos.y ? lerp(P.pos.y, h, Math.min(1, 20 * e)) : h), (P.vel.y = 0))
    : ((P.vel.y -= 18 * e),
      (P.pos.y += P.vel.y * e),
      P.pos.y <= h
        ? (!P.ground &&
            P.vel.y < -3 &&
            ((P.land = Math.min(1, -P.vel.y / 12)), sndStep(surfAt(P.pos.x, P.pos.z, P.pos.y), null, 1.4, !0)),
          (P.pos.y = h),
          (P.vel.y = 0),
          (P.ground = !0))
        : (P.ground = !1));
  for (const e of boxesAt(P.pos.x, P.pos.z, 0.05))
    if (P.vel.y > 0 && e.min[1] > P.pos.y + 1 && e.min[1] < P.pos.y + 1.85 && inBoxXZ(e, P.pos.x, P.pos.z, 0)) {
      P.vel.y = 0;
      break;
    }
  if (((P.spd = Math.hypot(P.vel.x, P.vel.z)), (P.land = Math.max(0, P.land - 3 * e)), P.ground && P.spd > 0.6)) {
    P.step += P.spd * e;
    const t = P.sprint ? 2.1 : P.crouch > 0.5 ? 1.1 : 1.55;
    P.step > t &&
      ((P.step = 0), sndStep(surfAt(P.pos.x, P.pos.z, P.pos.y), null, P.crouch > 0.5 ? 0.35 : 0.8, P.sprint));
  }
  (G.regenT > 0 && ((G.regenT -= e), (P.hp = Math.min(100, P.hp + 10 * e))),
    G.t - P.lastHurt > 5 && (P.hp = Math.min(100, P.hp + 16 * e)),
    G.stimT > 0 && (G.stimT -= e),
    P.pos.y < -30 && ((P.hp = 0), die(NET.me, G.name, 'caída')));
}
function updateCamera(e) {
  if (!P.alive) {
    const e = 1 - Math.pow(1 - Math.min(1, 1.4 * P.deathT), 3);
    return (
      camera.position.set(P.pos.x, P.pos.y + lerp(1.5, 0.22, e), P.pos.z),
      camera.rotation.set(lerp(P.pitch, -0.25, e), P.yaw, 1.2 * e),
      (camera.fov = 74),
      void camera.updateProjectionMatrix()
    );
  }
  const t = lerp(1.56, 1.02, P.crouch),
    o = P.ground ? Math.min(1, P.spd / 4) * (1 + P.sprintK * FEEL.sprintBob) * (1 - 0.85 * P.ads) : 0;
  P.ground && (P.bob += e * P.spd * 1.85);
  const n = (Math.abs(Math.sin(P.bob)) - 0.5) * FEEL.bobUp * o,
    a = Math.sin(P.bob) * FEEL.bobSide * o;
  G.shake = Math.max(0, G.shake - 2.5 * e);
  const r = G.shake * G.shake;
  ((P.recP -= P.recP * Math.min(1, 9 * e)), (P.recY -= P.recY * Math.min(1, 7 * e)));
  const s = V3(Math.cos(P.yaw), 0, -Math.sin(P.yaw));
  camera.position.set(P.pos.x + s.x * a, P.pos.y + t + n - 0.12 * P.land, P.pos.z + s.z * a);
  const l = P.vel.x * s.x + P.vel.z * s.z;
  camera.rotation.set(
    P.pitch + P.recP + (Math.random() - 0.5) * r * 0.06,
    P.yaw + P.recY + (Math.random() - 0.5) * r * 0.06,
    -l * FEEL.strafeRoll + Math.sin(P.bob) * FEEL.bobRoll * o + (Math.random() - 0.5) * r * 0.03
  );
  const i = lerp(74, P.w.fov, P.ads * P.ads * (3 - 2 * P.ads));
  Math.abs(camera.fov - i) > 0.01 && ((camera.fov = i), camera.updateProjectionMatrix());
}
function updateVM(e) {
  if (!VM.root) return;
  const t = P.w,
    o = VM.gun,
    n = P.ads * P.ads * (3 - 2 * P.ads);
  VM.root.visible = P.alive && !(t.scope && P.ads > 0.9);
  const a = t.melee ? [0.15, -0.17, -0.34] : 'pistol' === t.key ? [0.11, -0.125, -0.44] : [0.125, -0.165, -0.37],
    r = [0, -o.sightY, t.scope ? -0.16 : -0.165];
  let s = lerp(a[0], r[0], n),
    l = lerp(a[1], r[1], n),
    i = lerp(a[2], r[2], n),
    c = 0.03 * (1 - n),
    d = 0.05 * (1 - n),
    u = -0.06 * (1 - n);
  const p = P.sprintK;
  ((s -= 0.06 * p), (l -= 0.05 * p), (i += 0.03 * p), (c -= 0.35 * p), (d += 0.6 * p), (u += 0.25 * p));
  const m =
    P.reload > 0 && !t.shell ? Math.sin(clamp(1 - P.reload / t.reload, 0, 1) * Math.PI) : P.reload > 0 ? 0.5 : 0;
  if (((c += 0.3 * m), (u += 0.55 * m), (l -= 0.04 * m), o.mag && !t.shell)) {
    const e = P.reload > 0 ? 1 - P.reload / t.reload : 1;
    ((o.mag.visible = !(e > 0.25 && e < 0.55)),
      (o.mag.position.y =
        (o.mag.userData.y0 ?? (o.mag.userData.y0 = o.mag.position.y)) - (e > 0.15 && e < 0.3 ? 1.5 * (e - 0.15) : 0)));
  }
  if (t.bolt && P.bolt > 0) {
    const e = 1 - P.bolt / (60 / t.rpm);
    u += 0.25 * Math.sin(clamp(1.6 * e, 0, 1) * Math.PI);
  }
  if (o.pump) {
    const e = P.fireCD > 0 ? Math.sin(clamp(1 - P.fireCD / (60 / t.rpm), 0, 1) * Math.PI) : 0;
    ((o.pump.position.z = 0.09 * e), (VM.arms.L.position.z = VM.arms.L.userData.z0 + 0.09 * e));
  }
  ((VM.sx += (-MOUSE.sdx * FEEL.swayX - VM.sx) * Math.min(1, 8 * e)),
    (VM.sy += (MOUSE.sdy * FEEL.swayY - VM.sy) * Math.min(1, 8 * e)));
  const h = P.ground ? Math.min(1, P.spd / 4) * (1 - 0.8 * n) : 0;
  if (
    ((s += 0.011 * Math.sin(P.bob) * h + VM.sx * (1 - n)),
    (l += 0.009 * -Math.abs(Math.cos(P.bob)) * h - VM.sy * (1 - n) - 0.04 * P.land * (1 - 0.7 * n)),
    VM.melee > 0)
  ) {
    const e = Math.sin((1 - VM.melee / 0.32) * Math.PI);
    ((i -= 0.16 * e), (l += 0.03 * e), (c -= 0.5 * e), (d += t.melee ? 0.4 * -e : 0.25 * e));
  }
  if ((null == VM.pyaw && ((VM.pyaw = P.yaw), (VM.ppitch = P.pitch)), e > 0)) {
    const t = angDiff(P.yaw, VM.pyaw),
      o = P.pitch - VM.ppitch,
      n = clamp((t / e) * FEEL.lagYaw, -FEEL.lagYawMax, FEEL.lagYawMax),
      a = clamp((-o / e) * FEEL.lagPitch, -FEEL.lagPitchMax, FEEL.lagPitchMax);
    ((VM.lvx = (VM.lvx || 0) + ((n - (VM.lx || 0)) * FEEL.lagSpringX - (VM.lvx || 0) * FEEL.lagDampX) * e),
      (VM.lvy = (VM.lvy || 0) + ((a - (VM.ly || 0)) * FEEL.lagSpringY - (VM.lvy || 0) * FEEL.lagDampY) * e),
      (VM.lx = (VM.lx || 0) + VM.lvx * e),
      (VM.ly = (VM.ly || 0) + VM.lvy * e));
  }
  ((VM.pyaw = P.yaw), (VM.ppitch = P.pitch));
  const f = 1 - n * FEEL.lagAds;
  ((d += VM.lx * f),
    (c += VM.ly * f),
    (u += 0.25 * VM.lx * f),
    (s += VM.lx * FEEL.lagShiftX * f),
    (l += VM.ly * FEEL.lagShiftY * f),
    (VM.kick -= VM.kick * Math.min(1, 16 * e)),
    (i += VM.kick * (1 - 0.5 * n)),
    (c += 1.6 * VM.kick * (1 - 0.92 * n)));
  const g = 0.004 * Math.sin(1.3 * G.t) * (1 - n),
    v = 1 - n;
  (VM.root.position.set(s, l + g, i), VM.root.rotation.set(c - VM.sy * v * 1.5, d + 2 * VM.sx * v, u + 3 * VM.sx * v));
}
function slotKeys() {
  return 'gun' === G.gm ? [GG[ggLevel()]] : [P.primary || CLASSES[G.cls].w, 'pistol', 'knife'];
}
function equip(e) {
  (P.w && P.w.key !== e && !P.w.melee && (P.mags[P.w.key] = { ammo: P.ammo, res: P.res }), setupLoadout(e));
  const t = P.mags[e];
  (t && ((P.ammo = t.ammo), (P.res = t.res)),
    P.w.melee && ((P.ammo = 0), (P.res = 0)),
    (P.fireCD = Math.max(P.fireCD, 0.3)));
}
function switchSlot(e) {
  if (!P.alive || G.paused || 'gun' === G.gm) return;
  const t = slotKeys()[e];
  !t || (P.w && P.w.key === t) || ((P.slot = e), equip(t), AU.ctx && click(AU.ctx.currentTime, 1100, 0.04, 0.5));
}
function curSpread(e) {
  const t = clamp(P.spd / 4.2, 0, 1.4),
    o = (1 + 1.15 * t) * (P.ground ? 1 : 2.2) * (1 - 0.4 * P.crouch);
  return lerp(e.spread * o, e.ads * (1 + 0.6 * t), P.ads) + P.bloom;
}
function startReload() {
  const e = P.w;
  !P.alive ||
    P.reload > 0 ||
    P.ammo >= e.mag ||
    P.res <= 0 ||
    ((P.reload = e.shell ? e.reload + 0.2 : e.reload), sndReload(e));
}
function updateWeapon(e) {
  const t = P.w;
  if (!t) return;
  if (t.melee) return ((P.ads = 0), MOUSE.l && !P.trig && doMelee(), void (P.trig = MOUSE.l));
  ((P.fireCD -= e), (P.bolt = Math.max(0, P.bolt - e)), (P.bloom = Math.max(0, P.bloom - 0.06 * e)));
  const o = MOUSE.r && P.alive && P.reload <= 0 && !G.paused;
  if (((P.ads = approach(P.ads, o ? 1 : 0, e * (t.scope ? 4.2 : 6.5))), P.reload > 0))
    if (((P.reload -= e), t.shell))
      (P.reload <= 0 &&
        P.ammo < t.mag &&
        P.res > 0 &&
        (P.ammo++, P.res--, P.ammo < t.mag && P.res > 0 ? ((P.reload = t.reload), sndReload(t)) : sndPump()),
        MOUSE.l && P.ammo > 0 && !P.trig && (P.reload = 0));
    else if (P.reload <= 0) {
      const e = Math.min(t.mag - P.ammo, P.res);
      ((P.ammo += e), (P.res -= e));
    }
  MOUSE.l && P.alive && !G.paused
    ? (P.reload <= 0 &&
        P.bolt <= 0 &&
        P.fireCD <= 0 &&
        (t.auto || !P.trig) &&
        (P.ammo > 0 ? shoot() : P.trig || (sndDry(), startReload())),
      (P.trig = !0))
    : (P.trig = !1);
}
