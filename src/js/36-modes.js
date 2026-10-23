/* Modos de juego: todos contra todos, equipos y gun game */
function ggLevelOf(e) {
  return Math.min(GG.length - 1, G.ggk.get(e) || 0);
}
function ggLevel() {
  return ggLevelOf(NET.me);
}
function teamOf(e) {
  if ((e = String(e)) === NET.me) return G.myTeam;
  if (e.startsWith('b')) {
    const t = BOTS[+e.slice(1)];
    return t ? t.team : 'B';
  }
  const t = REMOTE.get(e);
  return (t && t.team) || 'A';
}
function sameTeam(e, t) {
  return 'tdm' === G.gm && teamOf(e) === teamOf(t);
}
function humanCounts() {
  const e = { A: 0, B: 0 };
  e[G.myTeam]++;
  for (const t of REMOTE.values()) e[t.team || 'A']++;
  return e;
}
function modeOnKill(e, t, o, n, a) {
  if (G.matchOver || G.warm > 0) return void updateModeHud();
  const r = MODES[G.gm].limit;
  if ('tdm' === G.gm) {
    if (t !== e && !sameTeam(t, e)) {
      const e = teamOf(t);
      (G.team[e]++, G.team[e] >= r && endMatch(TEAMN[e], e === G.myTeam));
    }
  } else if ('ffa' === G.gm) {
    const o = SCORE.get(t);
    o && o.k >= r && t !== e && endMatch(n, t === NET.me);
  } else if (t !== e) {
    if (ggLevelOf(t) === GG.length - 1) return void endMatch(n, t === NET.me);
    G.ggk.set(t, (G.ggk.get(t) || 0) + 1);
    const e = ggLevelOf(t);
    if (t === NET.me)
      ((P.primary = GG[e]),
        (P.mags = {}),
        equip(GG[e]),
        center(WEAPONS[GG[e]].name.toUpperCase(), 'Arma ' + (e + 1) + ' de ' + GG.length));
    else if (t.startsWith('b')) {
      const o = BOTS[+t.slice(1)];
      o && setBotWeapon(o, GG[e]);
    }
  }
  updateModeHud();
}
function endMatch(e, t) {
  G.matchOver ||
    ((G.matchOver = !0),
    (G.matchT = 10),
    ($('#matchEnd').hidden = !1),
    ($('#meTitle').textContent = t ? 'VICTORIA' : 'DERROTA'),
    ($('#meSub').textContent = ('tdm' === G.gm ? 'Gana el equipo ' : 'Gana ') + e + ' · nueva partida en 10 s'),
    renderScore(),
    ($('#meScore').innerHTML = ''),
    $('#meScore').append($('#sbBody').closest('table').cloneNode(!0)),
    radio(t ? 'Objetivo cumplido. Buen trabajo.' : 'Misión fallida. Repliegue.'));
}
function clearScores() {
  (SCORE.clear(),
    (G.kills = G.deaths = G.streak = 0),
    (G.team = { A: 0, B: 0 }),
    (G.ggk = new Map()),
    (G.earned = { uav: 0, turret: 0, dogs: 0 }));
}
function resetMatch() {
  if (
    ((G.matchOver = !1),
    ($('#matchEnd').hidden = !0),
    clearScores(),
    (G.warm = 60),
    (G.warmPrev = 60),
    (P.primary = 'gun' === G.gm ? GG[0] : CLASSES[G.cls].w),
    (P.mags = {}),
    (P.alive = !1),
    (P.respawn = 0.1),
    NET.host)
  ) {
    makeBots(G.botTeams.length, G.botTeams);
    for (const e of BOTS) ((e.alive = !1), (e.ready = !1), (e.respawn = rand(0.3, 1.5)));
  }
  (updateStreakHud(), updateModeHud());
}
function beginLive() {
  if (
    (clearScores(),
    center('¡A JUGAR!', MODES[G.gm].name),
    radio('Calentamiento terminado. Adelante.'),
    (P.alive = !1),
    (P.respawn = 0.05),
    NET.host)
  ) {
    'tdm' === G.gm && makeBots(G.botTeams.length, G.botTeams);
    for (const e of BOTS)
      ((e.alive = !1), (e.ready = !1), (e.respawn = rand(0.1, 0.8)), 'gun' === G.gm && setBotWeapon(e, GG[0]));
  }
  (MY.turret && (scene.remove(MY.turret.model.root), (MY.turret = null)),
    MY.dogs.forEach(e => scene.remove(e.model.root)),
    (MY.dogs = []),
    updateStreakHud(),
    updateModeHud());
}
function updateModeHud() {
  const e = $('#modeHud');
  if (!e) return;
  const t = MODES[G.gm].limit;
  let o, n;
  if ('tdm' === G.gm) ((o = `SWAT ${G.team.A} — ${G.team.B} MÁSCARAS`), (n = `a ${t} bajas`));
  else if ('ffa' === G.gm) {
    let e = ['—', 0];
    for (const [, t] of SCORE) t.k > e[1] && (e = [t.n, t.k]);
    ((o = `${(SCORE.get(NET.me) || { k: 0 }).k} / ${t}`),
      (n = e[1] > 0 ? `líder ${e[0]} · ${e[1]}` : 'todos contra todos'));
  } else {
    const e = ggLevel();
    let t = ['—', 0];
    for (const [e, o] of G.ggk) o > t[1] && (t = [(SCORE.get(e) || { n: e }).n, o]);
    ((o = `ARMA ${e + 1} / ${GG.length}`),
      (n =
        WEAPONS[GG[e]].name +
        (e === GG.length - 1 ? ' · ¡baja final!' : '') +
        (t[1] > 0 ? ` · líder ${t[0]} (${Math.min(t[1] + 1, GG.length)})` : '')));
  }
  if (G.warm > 0) {
    const e = Math.ceil(G.warm);
    n = `calentamiento ${Math.floor(e / 60)}:${String(e % 60).padStart(2, '0')} · ` + n;
  }
  e.innerHTML = '';
  const a = document.createElement('b');
  a.textContent = o;
  const r = document.createElement('span');
  ((r.textContent = n), e.append(a, r));
}
function modeTick(e) {
  (G.matchOver &&
    ((G.matchT -= e),
    ($('#meSub').textContent = $('#meSub').textContent.replace(/\d+ s$/, Math.max(0, Math.ceil(G.matchT)) + ' s')),
    G.matchT <= 0 && resetMatch()),
    G.warm > 0 &&
      ((!NET.host && NET.online) || (G.warm = Math.max(0, G.warm - e)),
      G.warmPrev > 0 && G.warm <= 0 && beginLive(),
      (G.warmPrev = G.warm),
      (G.hudT = (G.hudT || 0) - e),
      G.hudT <= 0 && ((G.hudT = 0.5), updateModeHud())),
    P.meleeCD > 0 && (P.meleeCD -= e),
    VM.melee > 0 && (VM.melee = Math.max(0, VM.melee - e)));
}
