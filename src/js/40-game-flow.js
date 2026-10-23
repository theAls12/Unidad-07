/* Flujo: iniciar y salir de partida, vista previa */
async function go(e) {
  if (
    ((G.menuMode = e),
    ($('#err').textContent = ''),
    (G.name = ($('#nick').value.trim() || 'AL-07').toUpperCase().slice(0, 12)),
    savePrefs(),
    applyQuality(),
    audioInit(),
    'solo' !== e)
  ) {
    const t =
      'host' === e
        ? Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[(32 * Math.random()) | 0]).join('')
        : ($('#code').value || '').trim().toUpperCase();
    if ('join' === e && !/^[A-Z0-9]{3,5}$/.test(t))
      return (
        renderMenu(),
        ($('#err').textContent = 'Escribe el código de sala que te ha pasado tu amigo (4 caracteres).'),
        void $('#code').focus()
      );
    const o = [$('#go')];
    (o.forEach(e => (e.disabled = !0)), ($('#err').textContent = 'host' === e ? 'Creando sala…' : 'Conectando…'));
    try {
      const e = await netConnect(t);
      (($('#err').textContent = ''), e && e !== G.map && (G.map = e));
    } catch (e) {
      return (
        o.forEach(e => (e.disabled = !1)),
        renderMenu(),
        void ($('#err').textContent = e.message || 'No se pudo conectar.')
      );
    }
    o.forEach(e => (e.disabled = !1));
  } else ((NET.online = !1), (NET.me = 'local'), (NET.host = !0));
  startGame();
}
function startGame() {
  const e = () => {
    ((G.mode = 'play'),
      (G.paused = !1),
      (G.pauseView = null),
      (PAD.crouch = PAD.sprint = !1),
      ($('#menu').hidden = !0),
      ($('#hud').hidden = !1),
      showBoot(!1),
      hudStart(),
      setupLoadout(),
      makeBots(G.botCount),
      (G.botTeams = BOTS.map(e => e.team)),
      SCORE.clear(),
      (G.kills = G.deaths = G.streak = 0),
      (G.abCD = 0),
      (G.uav = G.pulse = G.sensor = 0),
      (G.clockT = 0),
      G.reveal.clear(),
      updateStreakHud(),
      MY.turret && scene.remove(MY.turret.model.root),
      (MY.turret = null),
      MY.dogs.forEach(e => scene.remove(e.model.root)),
      (MY.dogs = []),
      document.fullscreenElement || goFullscreen(),
      resetMatch(),
      (P.alive = !1),
      (VM.cls = G.cls),
      (G.nextCls = null),
      ($('#nextCls').textContent = ''));
    for (const e of DROPS) scene.remove(e.g);
    ((DROPS.length = 0),
      (G.flashlight = LV.post.flash),
      respawn(),
      updateModeHud(),
      setReverb(LV.post.reverb),
      startAmbience(),
      lockPointer(),
      center(MAPS[G.map].name.toUpperCase(), MODES[G.gm].name + (NET.online ? ' · sala ' + NET.code : '')));
  };
  LV.mapKey !== G.map || LV.todKey !== G.tod || LV.rainKey !== G.rain
    ? (showBoot(!0, 'Cargando ' + MAPS[G.map].name),
      setTimeout(() => {
        (loadMap(G.map), buildMinimap(), e());
      }, 40))
    : e();
}
function leaveGame() {
  for (const e of DROPS) scene.remove(e.g);
  ((DROPS.length = 0),
    ($('#prompt').hidden = !0),
    NET.online && NET.rm && NET.rm.leave().catch(() => {}),
    (NET.online = !1),
    (NET.rm = null),
    (NET.peers = []),
    (NET.me = 'local'),
    (NET.host = !0));
  for (const [, e] of REMOTE)
    (scene.remove(e.model.root), e.turret && scene.remove(e.turret.root), e.dogs.forEach(e => scene.remove(e.root)));
  REMOTE.clear();
  for (const e of BOTS) scene.remove(e.model.root);
  BOTS.length = 0;
  for (const e of NADES) scene.remove(e.mesh);
  ((NADES.length = 0),
    MY.turret && scene.remove(MY.turret.model.root),
    (MY.turret = null),
    MY.dogs.forEach(e => scene.remove(e.model.root)),
    (MY.dogs = []),
    VM.root && (camera.remove(VM.root), (VM.root = null)),
    FLASH && (FLASH.intensity = 0),
    (G.mode = 'menu'),
    (G.paused = !1),
    (G.menuMode = 'solo'),
    updateTouchUI());
  try {
    document.exitPointerLock();
  } catch (e) {}
  (($('#hud').hidden = !0),
    ($('#score').hidden = !0),
    ($('#menu').hidden = !1),
    renderMenu(),
    showView(G.menuView),
    (camera.fov = 74),
    camera.updateProjectionMatrix());
}
function validatePreview() {
  const e = [];
  for (const t of LV.preview || []) {
    const o = V3(...t.p),
      n = V3(...t.q),
      a = V3(...t.l),
      r = e =>
        LV.boxes.some(
          t =>
            e.x > t.min[0] - 0.25 &&
            e.x < t.max[0] + 0.25 &&
            e.z > t.min[2] - 0.25 &&
            e.z < t.max[2] + 0.25 &&
            e.y > t.min[1] - 0.25 &&
            e.y < t.max[1] + 0.25
        ),
      s = e => LV.terrain && e.y < LV.terrain(e.x, e.z) + 0.4;
    if (r(o) || r(n) || s(o) || s(n)) continue;
    if (!losClear(o, n, !1)) continue;
    const l = e => {
      const t = V3().subVectors(a, e),
        o = t.length(),
        n = rayWorld(e, t.normalize(), o, !1);
      return !n || n.t > 0.6 * o;
    };
    l(V3().lerpVectors(o, n, 0.35)) && l(n) && e.push({ p: o, q: n, l: a });
  }
  LV.shots = e;
}
function previewCam(e) {
  (void 0 !== LV.shots && LV.shotsKey === LV.mapKey + LV.todKey) ||
    (validatePreview(), (LV.shotsKey = LV.mapKey + LV.todKey), (G.pv = 0), (G.pvT = 0));
  const t = LV.shots;
  if (!t.length) return;
  ((G.pvT = (G.pvT || 0) + e), G.pvT > 11 && ((G.pvT = 0), (G.pv = ((G.pv || 0) + 1) % t.length)));
  const o = t[(G.pv || 0) % t.length],
    n = G.pvT / 11,
    a = n * n * (3 - 2 * n);
  (camera.position.lerpVectors(o.p, o.q, a),
    (camera.position.x += 0.015 * Math.sin(0.9 * GT.value)),
    (camera.position.y += 0.01 * Math.sin(1.7 * GT.value)),
    camera.lookAt(o.l),
    (camera.rotation.z += 0.006 * Math.sin(0.6 * GT.value)),
    FLASH && (FLASH.intensity = 0));
}
