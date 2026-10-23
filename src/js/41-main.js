/* Bucle principal y arranque */
function frame(e) {
  requestAnimationFrame(frame);
  const t = Math.min(0.05, Math.max(0, (e - last) / 1e3));
  ((last = e), (GT.value += t), (G.t += t));
  const o = POST.final.uniforms;
  if ((pollPad(t), 'play' === G.mode)) {
    if (((G.tuiT = (G.tuiT || 0) - t), G.tuiT <= 0 && ((G.tuiT = 0.25), updateTouchUI()), !G.paused || NET.online)) {
      ((G.clockT = (G.clockT || 0) + t),
        updatePlayer(t),
        updateWeapon(t),
        updateBots(t),
        updateRemote(t),
        updateMine(t),
        updateNades(t),
        updateDrops(t),
        modeTick(t),
        netTick(t),
        (G.abCD = Math.max(0, G.abCD - t)));
      for (const e of ['uav', 'pulse', 'sensor', 'thermal', 'nvg']) G[e] = Math.max(0, G[e] - t);
      ((G.flash = Math.max(0, G.flash - t)), (G.dmg = Math.max(0, G.dmg - 0.8 * t)));
    }
    (updateCamera(t),
      updateVM(t),
      updateHud(t),
      FLASH && (FLASH.intensity = G.flashlight && P.alive ? (G.nvg > 0 ? 10 : 38) : 0));
    for (const e of HEAT) e.emissiveIntensity = G.thermal > 0 ? 3.5 : 0;
    ((o.uExposure.value = LV.post.exp * (G.nvg > 0 ? 6 : 1) * (G.thermal > 0 ? 0.35 : 1)),
      (o.uDamage.value = clamp(0.7 * G.dmg, 0, 1)),
      (o.uHurt.value = P.alive ? Math.pow(clamp(1 - P.hp / 100, 0, 1), 1.35) * (0.85 + 0.15 * Math.sin(7.4 * G.t)) : 0),
      (G.blood = Math.max(0, G.blood - t * (P.alive ? 0.07 : 0.5))),
      (o.uBlood.value = G.blood),
      (o.uBloodSeed.value = G.bloodSeed),
      (o.uFlash.value = clamp(G.flash, 0, 1)),
      (o.uDeath.value = P.alive ? 0 : clamp(0.9 * P.deathT, 0, 1)),
      (o.uThermal.value = approach(o.uThermal.value, G.thermal > 0 ? 1 : 0, 4 * t)),
      (o.uNV.value = approach(o.uNV.value, G.nvg > 0 ? 1 : 0, 4 * t)),
      (o.uScope.value = P.w.scope && P.ads > 0.92 && P.alive ? 1 : 0),
      (o.uDistort.value = o.uScope.value ? 0.05 : lerp(0.32, 0.12, P.ads)),
      (o.uGrain.value = 0.12 + (G.nvg > 0 ? 0.1 : 0) + 0.05 * o.uHurt.value),
      (o.uCA.value = (0.0055 + 0.01 * o.uDamage.value + 0.008 * o.uHurt.value) * (1 - 0.7 * P.ads)),
      (o.uBlur.value = 0.55 * (1 - 0.9 * P.ads)),
      P.alive && P.hp < 35 && ((G.beatT = (G.beatT || 0) - t), G.beatT <= 0 && ((G.beatT = 0.85), sndBeat())),
      P.alive &&
        (P.sprint || P.hp < 40) &&
        ((G.brT = (G.brT || 0) - t), G.brT <= 0 && ((G.brT = P.sprint ? 0.9 : 1.4), sndBreath(!0))));
  } else if ('menu' === G.mode) {
    (previewCam(t),
      (o.uExposure.value = LV.post.exp * ('night' === todOf(G.map) ? 1.7 : 1)),
      (o.uDamage.value = 0),
      (o.uHurt.value = 0),
      (o.uBlood.value = 0),
      (o.uFlash.value = 0),
      (o.uDeath.value = 0),
      (o.uThermal.value = 0),
      (o.uNV.value = 0),
      (o.uScope.value = 0),
      (o.uDistort.value = 0.32),
      (o.uBlur.value = 0.55));
    for (const e of HEAT) e.emissiveIntensity = 0;
  }
  for (const e of LV.tick) e(GT.value, t);
  if ((updateFX(t), LV.sun)) {
    const e = (2 * LV.post.shadowR) / Q.shadow,
      t = Math.round(camera.position.x / e) * e,
      o = Math.round(camera.position.z / e) * e;
    (LV.sun.target.position.set(t, 0, o),
      LV.sun.position.set(t + LV.sunOff.x, LV.sunOff.y, o + LV.sunOff.z),
      LV.sun.target.updateMatrixWorld());
  }
  (updateListener(), ambienceTick(GT.value), renderFrame());
}
function boot() {
  try {
    initRenderer();
  } catch (e) {
    return void showBoot(!0, 'WebGL no disponible en este navegador');
  }
  (initSprites(),
    initFX(),
    loadPrefs(),
    (Q = QUALITY[G.quality]),
    resize(),
    initMenu(),
    setupInput(),
    initDevices(),
    ('function' == typeof fetchAssets
      ? fetchAssets((e, t) =>
          showBoot(!0, `Descargando ${((e * t) / 1048576).toFixed(1)} / ${(t / 1048576).toFixed(1)} MB`)
        )
      : Promise.resolve()
    )
      .catch(e => {
        throw (showBoot(!0, 'Error de descarga: ' + e.message + ' · recarga la página'), e);
      })
      .then(loadHands)
      .then(loadRealAssets)
      .then(() =>
        setTimeout(() => {
          (photoMats(),
            RA.lensdirt && (POST.final.uniforms.uDirt.value = 1),
            loadMap(G.map),
            buildMinimap(),
            renderMenu(),
            (G.mode = 'menu'),
            ($('#menu').hidden = !1),
            showView('match'),
            showBoot(!1),
            requestAnimationFrame(frame));
        }, 30)
      ));
}
boot();
