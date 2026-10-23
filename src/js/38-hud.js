/* HUD: marcador, minimapa, dron y cámara corporal */
function hudStart() {
  ($('#hud').classList.toggle('extreme', 'extreme' === G.hud),
    ($('#mapLbl').textContent = MAPS[G.map].name),
    ($('#unit').textContent = `UNIDAD 07 · ${G.name}`),
    ($('#room').hidden = !NET.online),
    ($('#net').hidden = !NET.online),
    NET.online && ($('#room').textContent = 'Sala ' + NET.code + (NET.host ? ' · anfitrión' : '')),
    ($('#feed').innerHTML = ''),
    ($('#prompt').hidden = !0),
    $('#uav').classList.remove('on'),
    (G.xhGap = null),
    hudKit());
}
function center(e, t = '') {
  const o = $('#center');
  if (((o.innerHTML = ''), o.append(document.createTextNode(e)), t)) {
    const e = document.createElement('small');
    ((e.textContent = t), o.append(e));
  }
  (o.classList.add('on'), (G.centerT = 2.8));
}
const WEAPON_WORD = {
  rifle: 'fusil',
  smg: 'subfusil',
  dmr: 'tirador',
  shotgun: 'escopeta',
  sniper: 'cerrojo',
  pistol: 'pistola',
  knife: 'cuchillo',
  turret: 'torreta',
  dog: 'perro',
  bot: 'fusil',
  frag: 'granada',
  caída: 'caída'
};
function addFeed(e, t, o, n) {
  const a = document.createElement('div');
  n && (a.className = 'me');
  const r = WEAPON_WORD[o] || o;
  a.textContent = e === t ? `${t} · ${r}` : `${e} ▸ ${t} · ${r}`;
  const s = $('#feed');
  for (s.prepend(a); s.children.length > 4;) s.lastChild.remove();
  (setTimeout(() => a.classList.add('old'), 6e3), setTimeout(() => a.remove(), 7e3));
}
function hudKit() {
  const e = { 3: 'uav', 6: 'turret', 10: 'dogs' },
    t = 'gun' === G.gm;
  $('#streaks').hidden = t;
  for (const t of [3, 6, 10]) {
    const o = $('#stk' + t),
      n = e[t];
    (o.classList.toggle('on', !!G.earned[n]),
      o.classList.toggle('next', !G.earned[n] && G.streak < t && [3, 6, 10].find(e => e > G.streak) === t),
      (o.querySelector('i').textContent = G.earned[n] ? glyph(n) || '✓' : t));
  }
  $('#streakCount').innerHTML = 'Racha <b>' + G.streak + '</b>';
  const o = (e, t, o, n) => {
      const a = $('#' + e);
      (a.classList.toggle('on', !!t), a.classList.toggle('hot', !!n), t && a.innerHTML !== o && (a.innerHTML = o));
    },
    n = CLASSES[G.cls].ab[G.ab];
  (o('kAb', !t && P.alive && G.abCD <= 0, `${kbd('ability')}${n.name}`),
    o('kArmor', P.alive && P.armor > 0, `Blindaje ${Math.ceil(P.armor)}`),
    o('kUav', !t && G.earned.uav, kbd('uav') + 'Dron UAV', !0),
    o('kTurret', !t && G.earned.turret, kbd('turret') + 'Torreta', !0),
    o('kDogs', !t && G.earned.dogs, kbd('dogs') + 'Unidad canina', !0));
}
function renderScore(e) {
  const t = $('#sbBody');
  t.innerHTML = '';
  const o = new Map(SCORE);
  (o.has(NET.me) || o.set(NET.me, { n: G.name, k: 0, d: 0 }), (o.get(NET.me).n = G.name));
  for (const e of BOTS) o.has('b' + e.i) || o.set('b' + e.i, { n: e.name, k: 0, d: 0 });
  for (const [e, t] of REMOTE) o.has(e) || o.set(e, { n: t.name, k: 0, d: 0 });
  [...o.entries()]
    .sort((e, t) => t[1].k - e[1].k)
    .forEach(([e, o]) => {
      const n = document.createElement('tr'),
        a = (e =>
          'tdm' !== G.gm
            ? ''
            : e === NET.me
              ? G.myTeam
              : 'b' === e[0] && BOTS[+e.slice(1)]
                ? BOTS[+e.slice(1)].team
                : REMOTE.get(e)
                  ? REMOTE.get(e).team
                  : '')(e);
      n.className = (e === NET.me ? 'me ' : '') + (a ? 't' + a.toLowerCase() : '');
      for (const [e, t] of [
        [o.n, ''],
        [o.k, 'n'],
        [o.d, 'n']
      ]) {
        const o = document.createElement('td');
        ((o.textContent = e), t && (o.className = t), n.append(o));
      }
      t.append(n);
    });
  const n = $('#sbAdmin');
  if (!n || e) return;
  if (((n.hidden = !(NET.host && 'play' === G.mode)), n.hidden)) return;
  n.innerHTML = '';
  const a = (e, t) => {
      const o = document.createElement('div');
      o.className = 'grp';
      const a = BOTS.filter(e => 'tdm' !== G.gm || e.team === t).length,
        r = document.createElement('span');
      r.textContent = e + ': ' + a;
      const s = document.createElement('button');
      ((s.textContent = '−'), (s.title = 'Quitar bot'), (s.onclick = () => removeBot(t)));
      const l = document.createElement('button');
      ((l.textContent = '+'), (l.title = 'Añadir bot'), (l.onclick = () => addBot(t)), o.append(r, s, l), n.append(o));
    },
    r = document.createElement('span');
  ((r.textContent = 'Bots (anfitrión)'),
    (r.style.color = 'var(--dim)'),
    n.append(r),
    'tdm' === G.gm ? (a('SWAT', 'A'), a('Máscaras', 'B')) : a('Bots', 'B'));
  const s = document.createElement('span');
  ((s.className = 'hint'), (s.textContent = G.tabOpen ? 'Tab para volver a la partida' : ''), n.append(s));
}
function buildMinimap() {
  const e = document.createElement('canvas');
  e.width = e.height = 1024;
  const t = e.getContext('2d'),
    o = LV.bounds + 6,
    n = 1024 / (2 * o);
  ((t.fillStyle = '#0c0f0e'), t.fillRect(0, 0, 1024, 1024), (t.fillStyle = 'rgba(170,182,176,.55)'));
  for (const e of LV.boxes)
    if (!(e.max[1] - e.min[1] < 1.1 || e.max[1] < 1.3 || e.min[1] > 3))
      if (e.o) {
        const a = e.o;
        t.beginPath();
        for (const [e, r] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1]
        ]) {
          const s = e * a.hx,
            l = r * a.hz;
          t.lineTo((a.cx + s * a.c + l * a.s + o) * n, (a.cz - s * a.s + l * a.c + o) * n);
        }
        t.fill();
      } else
        t.fillRect(
          (e.min[0] + o) * n,
          (e.min[2] + o) * n,
          Math.max(1, (e.max[0] - e.min[0]) * n),
          Math.max(1, (e.max[2] - e.min[2]) * n)
        );
  t.fillStyle = 'rgba(120,140,128,.35)';
  for (const e of LV.cyls)
    (t.beginPath(), t.arc((e.x + o) * n, (e.z + o) * n, Math.max(1.2, e.r * n * 1.6), 0, TAU), t.fill());
  MINI = { c: e, B: o, s: n };
}
function mapEnemies(e) {
  const t = G.uav > 0 || G.pulse > 0,
    o = (o, n) => {
      if (sameTeam(NET.me, o)) return;
      const a = G.reveal.get(o),
        r = G.sensor > 0 && n.distanceTo(P.pos) < 30;
      t || r ? e(n.x, n.z, 1) : a && G.t - a.t < 2 && e(a.p.x, a.p.z, 1 - (G.t - a.t) / 2);
    };
  for (const e of BOTS) e.alive && e.ready && o('b' + e.i, e.vpos);
  for (const [e, t] of REMOTE) t.alive && o(e, t.pos);
}
function drawDroneFeed() {
  const e = $('#uavc'),
    t = e.getContext('2d'),
    o = e.width,
    n = o / 2,
    a = o / 68;
  (t.save(),
    (t.fillStyle = '#000'),
    t.fillRect(0, 0, o, o),
    t.translate(n - P.pos.x * a, n - P.pos.z * a),
    MINI && t.drawImage(MINI.c, -MINI.B * a, -MINI.B * a, 2 * MINI.B * a, 2 * MINI.B * a));
  const r = (e, o, n, r = 7) => {
    ((t.fillStyle = n),
      (t.shadowColor = n),
      (t.shadowBlur = 10),
      t.beginPath(),
      t.arc(e * a, o * a, r, 0, TAU),
      t.fill(),
      (t.shadowBlur = 0));
  };
  if ((mapEnemies((e, t, o) => r(e, t, `rgba(255,243,224,${o})`)), 'tdm' === G.gm)) {
    for (const e of BOTS) e.alive && e.ready && e.team === G.myTeam && r(e.vpos.x, e.vpos.z, '#5aa9ff', 6);
    for (const e of REMOTE.values()) e.alive && e.team === G.myTeam && r(e.pos.x, e.pos.z, '#5aa9ff', 7);
  }
  MY.turret && r(MY.turret.pos.x, MY.turret.pos.z, '#f0c24b', 6);
  for (const e of MY.dogs) r(e.pos.x, e.pos.z, '#f0c24b', 5);
  (t.restore(),
    t.save(),
    t.translate(n, n),
    t.rotate(-P.yaw),
    (t.fillStyle = '#f0c24b'),
    t.beginPath(),
    t.moveTo(0, -12),
    t.lineTo(8, 9),
    t.lineTo(0, 4),
    t.lineTo(-8, 9),
    t.closePath(),
    t.fill(),
    t.restore());
  const s = ((0.35 * G.t) % 1) * o;
  ((t.fillStyle = 'rgba(255,255,255,.06)'),
    t.fillRect(0, s, o, 3),
    (t.strokeStyle = 'rgba(255,255,255,.25)'),
    t.strokeRect(n - 14, n - 14, 28, 28));
}
function drawMinimap() {
  const e = $('#mini'),
    t = e.getContext('2d'),
    o = e.width,
    n = o / 2,
    a = o / 76;
  (t.clearRect(0, 0, o, o),
    t.save(),
    t.beginPath(),
    t.arc(n, n, n - 3, 0, TAU),
    t.clip(),
    (t.fillStyle = 'rgba(6,8,7,.62)'),
    t.fillRect(0, 0, o, o),
    t.translate(n, n),
    t.rotate(P.yaw),
    t.translate(-P.pos.x * a, -P.pos.z * a),
    MINI &&
      ((t.globalAlpha = 0.75),
      t.drawImage(MINI.c, -MINI.B * a, -MINI.B * a, 2 * MINI.B * a, 2 * MINI.B * a),
      (t.globalAlpha = 1)));
  const r = (n - 12) / a,
    s = (e, o, n, s = 7) => {
      let l = e - P.pos.x,
        i = o - P.pos.z;
      const c = Math.hypot(l, i),
        d = c > r;
      d && ((l *= r / c), (i *= r / c));
      const u = (P.pos.x + l) * a,
        p = (P.pos.z + i) * a;
      ((t.fillStyle = n),
        t.beginPath(),
        t.arc(u, p, d ? 0.75 * s : s, 0, TAU),
        t.fill(),
        d && ((t.lineWidth = 2), (t.strokeStyle = 'rgba(0,0,0,.7)'), t.stroke()));
    };
  if ((mapEnemies((e, t, o) => s(e, t, `rgba(255,75,62,${o})`)), 'tdm' === G.gm)) {
    for (const e of BOTS) e.alive && e.ready && e.team === G.myTeam && s(e.vpos.x, e.vpos.z, '#5aa9ff', 6);
    for (const e of REMOTE.values()) e.alive && e.team === G.myTeam && s(e.pos.x, e.pos.z, '#5aa9ff', 7);
  }
  MY.turret && s(MY.turret.pos.x, MY.turret.pos.z, '#f0c24b', 6);
  for (const e of MY.dogs) s(e.pos.x, e.pos.z, '#f0c24b', 5);
  if ('tdm' === G.gm)
    for (const e of REMOTE.values())
      if (e.team === G.myTeam) {
        e.turret && s(e.turret.root.position.x, e.turret.root.position.z, '#9fd0ff', 6);
        for (const t of e.dogs) s(t.root.position.x, t.root.position.z, '#9fd0ff', 5);
      }
  if ((t.restore(), G.uav > 0)) {
    const e = 2.2 * G.t;
    ((t.strokeStyle = 'rgba(240,194,75,.5)'),
      (t.lineWidth = 2),
      t.beginPath(),
      t.moveTo(n, n),
      t.lineTo(n + Math.cos(e) * n, n + Math.sin(e) * n),
      t.stroke());
  }
  ((t.fillStyle = '#f4f6f0'),
    t.beginPath(),
    t.moveTo(n, n - 11),
    t.lineTo(n + 7, n + 8),
    t.lineTo(n, n + 4),
    t.lineTo(n - 7, n + 8),
    t.closePath(),
    t.fill(),
    (t.strokeStyle = 'rgba(244,246,240,.35)'),
    (t.lineWidth = 3),
    t.beginPath(),
    t.arc(n, n, n - 3, 0, TAU),
    t.stroke());
}
function drawHud(e) {
  const t = $('#hudc'),
    o = t.getContext('2d');
  o.clearRect(0, 0, t.width, t.height);
  const n = W / 2,
    a = H / 2,
    r = P.w,
    s = 4 + (Math.tan(r.melee ? 0.01 : curSpread(r)) * H) / (2 * Math.tan((camera.fov * Math.PI) / 360));
  if (
    ((G.xhGap = null == G.xhGap ? s : G.xhGap + (s - G.xhGap) * Math.min(1, 14 * e)),
    'extreme' !== G.hud && P.alive && P.ads < 0.6)
  ) {
    const e = G.xhGap,
      t = 8,
      r = 0.85 * (1 - P.ads / 0.6),
      s = () => {
        (o.beginPath(),
          o.moveTo(n - e - t, a),
          o.lineTo(n - e, a),
          o.moveTo(n + e, a),
          o.lineTo(n + e + t, a),
          o.moveTo(n, a - e - t),
          o.lineTo(n, a - e),
          o.moveTo(n, a + e),
          o.lineTo(n, a + e + t),
          o.stroke());
      };
    ((o.strokeStyle = `rgba(0,0,0,${0.5 * r})`),
      (o.lineWidth = 4),
      s(),
      (o.strokeStyle = `rgba(255,255,255,${r})`),
      (o.lineWidth = 2),
      s());
  }
  if (G.hitT > 0) {
    G.hitT -= e;
    const t = clamp(G.hitT / 0.16, 0, 1);
    ((o.strokeStyle = G.hitKill ? `rgba(255,70,50,${t})` : `rgba(255,255,255,${0.85 * t})`), (o.lineWidth = 2));
    const r = 7,
      s = 13;
    for (const [e, t] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
    ])
      (o.beginPath(), o.moveTo(n + e * r, a + t * r), o.lineTo(n + e * s, a + t * s), o.stroke());
  }
  for (let t = G.dmgDirs.length - 1; t >= 0; t--) {
    const r = G.dmgDirs[t];
    if (((r.t -= e), r.t <= 0)) {
      G.dmgDirs.splice(t, 1);
      continue;
    }
    const s = -(r.a - Math.atan2(-Math.sin(P.yaw), -Math.cos(P.yaw))) - Math.PI / 2,
      l = 0.46 * Math.min(W, H),
      i = n + Math.cos(s) * l,
      c = a + Math.sin(s) * l,
      d = o.createRadialGradient(i, c, 0, i, c, 0.55 * l);
    (d.addColorStop(0, `rgba(170,10,0,${0.45 * clamp(r.t, 0, 1)})`),
      d.addColorStop(1, 'rgba(170,10,0,0)'),
      (o.fillStyle = d),
      o.fillRect(i - l, c - l, 2 * l, 2 * l));
  }
  const l = V3(),
    i = e => (
      l.copy(e).project(camera),
      l.z > 1 || Math.abs(l.x) > 1.05 || Math.abs(l.y) > 1.05 ? null : [(0.5 * l.x + 0.5) * W, (0.5 * -l.y + 0.5) * H]
    );
  if (G.pulse > 0 || G.sensor > 0) {
    const e = [];
    for (const t of BOTS) t.alive && t.ready && !sameTeam(NET.me, 'b' + t.i) && e.push(t.vpos);
    for (const [t, o] of REMOTE) o.alive && !sameTeam(NET.me, t) && e.push(o.pos);
    for (const t of e) {
      if (G.pulse <= 0 && t.distanceTo(P.pos) > 30) continue;
      const e = i(V3(t.x, t.y + 1.2, t.z));
      e &&
        ((o.strokeStyle = 'rgba(255,75,62,.9)'),
        (o.lineWidth = 2),
        o.beginPath(),
        o.moveTo(e[0], e[1] - 10),
        o.lineTo(e[0] + 8, e[1]),
        o.lineTo(e[0], e[1] + 10),
        o.lineTo(e[0] - 8, e[1]),
        o.closePath(),
        o.stroke());
    }
  }
  if ('tdm' === G.gm) {
    const e = [];
    for (const t of BOTS) t.alive && t.ready && t.team === G.myTeam && e.push([t.vpos, t.name]);
    for (const t of REMOTE.values()) t.alive && t.team === G.myTeam && e.push([t.pos, t.name]);
    ((o.font = "500 11px 'IBM Plex Mono', monospace"), (o.textAlign = 'center'));
    for (const [t, r] of e) {
      const e = i(V3(t.x, t.y + 2.05, t.z));
      if (!e) continue;
      const s = Math.hypot(e[0] - n, e[1] - a) < 90;
      ((o.fillStyle = 'rgba(90,169,255,.85)'),
        o.beginPath(),
        o.moveTo(e[0] - 6, e[1] - 5),
        o.lineTo(e[0] + 6, e[1] - 5),
        o.lineTo(e[0], e[1] + 3),
        o.closePath(),
        o.fill(),
        s && o.fillText(r, e[0], e[1] - 10));
    }
  }
}
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
function updateHud(e) {
  ($('#score').hidden || ((G.sbT = (G.sbT || 0) - e), G.sbT <= 0 && ((G.sbT = 0.5), renderScore(!0))),
    G.centerT > 0 && ((G.centerT -= e), G.centerT <= 0 && $('#center').classList.remove('on')));
  const t = LV.clock,
    o = 3600 * t[0] + 60 * t[1] + t[2] + Math.floor(G.clockT || 0),
    n = Math.floor(o / 3600) % 24,
    a = Math.floor(o / 60) % 60,
    r = o % 60;
  $('#clock').textContent =
    `2026-10-14 ${String(n).padStart(2, '0')}:${String(a).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  const s = ((((180 * -P.yaw) / Math.PI) % 360) + 360) % 360;
  if (
    (($('#hdg').textContent =
      `RUMBO ${String(Math.round(s) % 360).padStart(3, '0')}° ${COMPASS[Math.round(s / 45) % 8]}`),
    (G.kitT = (G.kitT || 0) - e),
    G.kitT <= 0 && ((G.kitT = 0.25), hudKit()),
    'extreme' === G.hud)
  ) {
    const e = G.uav > 0 || G.pulse > 0 || G.sensor > 0;
    ($('#uav').classList.toggle('on', e), e && drawDroneFeed());
  } else (updateFullHud(), drawMinimap());
  drawHud(e);
}
function updateFullHud() {
  const e = Math.ceil(Math.max(0, P.hp));
  (($('#hpTxt').textContent = e),
    ($('#hpBar i').style.width = clamp(P.hp, 0, 100) + '%'),
    $('#hpBar').classList.toggle('low', e < 35));
  const t = $('#armorBar');
  ((t.hidden = P.armor <= 0), P.armor > 0 && (t.firstElementChild.style.width = (P.armor / 60) * 100 + '%'));
  const o = CLASSES[G.cls].ab[G.ab];
  (($('#ability').hidden = 'gun' === G.gm),
    ($('#abName').textContent = o.name),
    ($('#abCd').style.width = 100 * (1 - G.abCD / o.cd) + '%'),
    $('#ability').classList.toggle('ready', G.abCD <= 0));
  const n = P.w;
  $('#wName').textContent = n.name;
  const a = $('#ammoBox');
  (($('#ammoNow').textContent = n.melee ? '—' : P.reload > 0 && !n.shell ? '··' : P.ammo),
    ($('#ammoRes').textContent = n.melee ? '' : '/ ' + P.res),
    a.classList.toggle('low', !n.melee && P.ammo > 0 && P.ammo <= Math.ceil(0.25 * n.mag)),
    a.classList.toggle('empty', !n.melee && 0 === P.ammo));
  const r = slotKeys(),
    s = $('#slots').children;
  for (let e = 0; e < 3; e++) ((s[e].hidden = !r[e]), s[e].classList.toggle('on', r[e] === n.key));
}
