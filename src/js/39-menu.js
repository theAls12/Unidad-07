/* Menú y pausa */
function loadPrefs() {
  try {
    const e = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
    (e.cls >= 0 && e.cls < CLASSES.length && (G.cls = e.cls),
      (0 !== e.ab && 1 !== e.ab) || (G.ab = e.ab),
      MAPS[e.map] && (G.map = e.map),
      e.name && (G.name = String(e.name).slice(0, 12)),
      QUALITY[e.q] && (G.quality = e.q),
      TODS[e.tod] && (G.tod = e.tod),
      MODES[e.gm] && (G.gm = e.gm),
      ('A' !== e.tm && 'B' !== e.tm) || (G.myTeam = e.tm),
      ('full' !== e.hud && 'extreme' !== e.hud) || (G.hud = e.hud));
  } catch (e) {}
}
function savePrefs() {
  try {
    localStorage.setItem(
      PREF_KEY,
      JSON.stringify({
        cls: G.cls,
        ab: G.ab,
        map: G.map,
        name: G.name,
        q: G.quality,
        gm: G.gm,
        tm: G.myTeam,
        hud: G.hud,
        tod: G.tod
      })
    );
  } catch (e) {}
}
function optBtn(e, t, o, n, a) {
  const r = document.createElement('button');
  ((r.className = 'opt'), (r.type = 'button'), r.setAttribute('aria-pressed', n ? 'true' : 'false'));
  const s = document.createElement('span');
  if (((s.className = 'nm'), (s.textContent = e), r.append(s), null != t)) {
    const e = document.createElement('span');
    ((e.className = 'meta'), (e.textContent = t), r.append(e));
  }
  if (o) {
    const e = document.createElement('span');
    ((e.className = 'ds'), (e.textContent = o), r.append(e));
  }
  return ((r.onclick = a), r);
}
function fillOpts(e, t, o, n) {
  const a = $('#' + e);
  a.innerHTML = '';
  for (const e of t) a.append(optBtn(e.nm, e.meta, e.ds, e.k === o, () => n(e.k)));
}
const hhmm = e => String(e[0]).padStart(2, '0') + ':' + String(e[1]).padStart(2, '0'),
  QUALITY_NAMES = { ultra: 'Ultra', high: 'Alta', mid: 'Media', low: 'Baja' },
  NET_OPTS = [
    { k: 'solo', nm: 'Solo' },
    { k: 'host', nm: 'Crear sala' },
    { k: 'join', nm: 'Unirse' }
  ],
  GO_TXT = { solo: 'Jugar', host: 'Crear sala', join: 'Entrar' },
  inPause = () => 'play' === G.mode;
function showView(e) {
  (['match', 'op'].includes(e) || (e = 'match'), inPause() ? (G.pauseView = e) : (G.menuView = e));
  for (const [t, o] of [
    ['match', 'vMatch'],
    ['op', 'vOp']
  ])
    $('#' + o).hidden = t !== e;
  for (const t of document.querySelectorAll('#menu .tabs button'))
    t.setAttribute('aria-selected', t.dataset.tab === e ? 'true' : 'false');
  $('#mBody').scrollTop = 0;
}
function setNextLoadout(e, t) {
  e === G.cls && t === G.ab ? (G.nextCls = null) : ((G.nextCls = e), (G.nextAb = t));
}
function switchTeam(e) {
  if (e !== G.myTeam) {
    if (humanCounts()[e] >= 6) return (G.opMsg = 'Ese equipo está lleno (6 jugadores).');
    ((G.myTeam = e),
      savePrefs(),
      P.alive &&
        ((P.hp = 0),
        (P.alive = !1),
        (P.respawn = 2),
        ($('#death').hidden = !1),
        ($('#deathBy').textContent = 'Cambiando a ' + TEAMN[e])),
      NET.host && 'tdm' === G.gm && (makeBots(G.botTeams.length, G.botTeams), (G.botTeams = BOTS.map(e => e.team))));
  }
}
function renderMenu() {
  const e = inPause(),
    t = !e && 'join' === G.menuMode,
    o = (e, t) => {
      ((G[e] = t), savePrefs(), renderMenu());
    };
  $('#menu').classList.toggle('paused', e);
  const n = !e && !t;
  if ((($('#matchEdit').hidden = !n), ($('#matchInfo').hidden = n), n)) {
    (fillOpts(
      'gmList',
      Object.entries(MODES).map(([e, t]) => ({ k: e, nm: t.name, meta: t.meta })),
      G.gm,
      e => o('gm', e)
    ),
      fillOpts(
        'mapList',
        Object.entries(MAPS).map(([e, t]) => ({ k: e, nm: t.name })),
        G.map,
        e => {
          G.map !== e && (o('map', e), switchPreview(e));
        }
      ),
      fillOpts(
        'todList',
        Object.entries(TODS).map(([e, t]) => ({ k: e, nm: t.name })),
        todOf(G.map),
        e => {
          todOf(G.map) !== e && (o('tod', e), switchPreview(G.map));
        }
      ));
    const e = G.botCount;
    (($('#bots').textContent = e),
      ($('#botsNote').textContent = `${e + 1}/12 · ${11 - e} libres`),
      fillOpts(
        'hudList',
        [
          { k: 'full', nm: 'Normal' },
          { k: 'extreme', nm: 'Extremo' }
        ],
        G.hud,
        e => o('hud', e)
      ),
      ($('#hudNote').textContent =
        'extreme' === G.hud ? 'Sin minimapa, mira, vida ni munición' : 'Minimapa, vida, munición y rachas'));
  } else {
    const t = $('#sumList');
    if (((t.innerHTML = ''), e)) {
      const e = (e, o, n) => {
        const a = document.createElement('dt'),
          r = document.createElement('dd');
        if (((a.textContent = e), (r.textContent = o), n)) {
          const e = document.createElement('small');
          ((e.textContent = n), r.append(e));
        }
        t.append(a, r);
      };
      (e('Modo', MODES[G.gm].name, MODES[G.gm].meta),
        e('Zona', MAPS[G.map].name, TODS[todOf(G.map)].name),
        e('Interfaz', 'extreme' === G.hud ? 'Extremo' : 'Normal'));
    }
    ((t.hidden = !e),
      ($('#net').hidden = !(e && NET.online)),
      ($('#infoNote').textContent = e
        ? NET.host
          ? 'Mantén Tab para ver el marcador y añadir o quitar bots.'
          : 'Mantén Tab para ver el marcador.'
        : 'La partida la configura el anfitrión de la sala.'));
  }
  (($('#nick').disabled = e),
    ($('#nick').value = G.name),
    ($('#teamRow').hidden = !('tdm' === G.gm || t)),
    fillOpts(
      'teamList',
      [
        { k: 'A', nm: 'SWAT' },
        { k: 'B', nm: 'Máscaras de gas' }
      ],
      G.myTeam,
      t => {
        (e ? switchTeam(t) : (G.myTeam = t), savePrefs(), renderMenu());
      }
    ));
  const a = e && null != G.nextCls ? G.nextCls : G.cls,
    r = e && null != G.nextCls ? G.nextAb : G.ab;
  if (
    (fillOpts(
      'clsList',
      CLASSES.map((e, t) => ({ k: t, nm: e.name, meta: WEAPONS[e.w].name, ds: e.desc })),
      a,
      t => {
        const o = Math.min(r, CLASSES[t].ab.length - 1);
        (e ? setNextLoadout(t, o) : ((G.cls = t), (G.ab = o), savePrefs()), renderMenu());
      }
    ),
    fillOpts(
      'abList',
      CLASSES[a].ab.map((e, t) => ({ k: t, nm: e.name, ds: e.desc + ' Recarga ' + e.cd + ' s.' })),
      r,
      t => {
        (e ? setNextLoadout(a, t) : o('ab', t), renderMenu());
      }
    ),
    e && null != G.nextCls)
  ) {
    for (const e of $('#clsList').children) e.classList.toggle('pend', 'true' === e.getAttribute('aria-pressed'));
    $('#nextCls').textContent =
      'Al reaparecer: ' + CLASSES[G.nextCls].name + ' · ' + CLASSES[G.nextCls].ab[G.nextAb].name + '.';
  } else $('#nextCls').textContent = G.opMsg || '';
  if (
    ((G.opMsg = ''),
    fillOpts(
      'qList',
      Object.keys(QUALITY).map(e => ({ k: e, nm: QUALITY_NAMES[e] || e })),
      G.quality,
      e => o('quality', e)
    ),
    ($('#qNote').textContent = e && QUALITY[G.quality] !== Q ? 'Se aplicará en la próxima partida.' : ''),
    ($('#actMenu').hidden = e),
    ($('#actPause').hidden = !e),
    !e)
  ) {
    const e = G.menuMode || 'solo';
    (fillOpts('netList', NET_OPTS, e, e => {
      ((G.menuMode = e), ($('#err').textContent = ''), renderMenu(), 'join' === e && $('#code').focus());
    }),
      ($('#joinRow').hidden = 'join' !== e),
      ($('#netNote').hidden = 'solo' === e),
      ($('#goTxt').textContent = GO_TXT[e]),
      ($('#goSub').textContent =
        'join' === e
          ? 'Sala de tu amigo'
          : [
              MAPS[G.map].name,
              TODS[todOf(G.map)].name,
              G.botCount ? G.botCount + ' bots' : 'sin bots',
              'extreme' === G.hud ? 'extremo' : ''
            ]
              .filter(Boolean)
              .join(' · ')));
  }
}
function openPause() {
  'play' === G.mode &&
    ((G.paused = !0),
    (G.pauseAt = performance.now()),
    ($('#pauseNote').textContent = ''),
    updateTouchUI(),
    (MOUSE.l = MOUSE.r = !1),
    ($('#menu').hidden = !1),
    renderMenu(),
    showView(G.pauseView || 'op'),
    'pad' === G.input && $('#resume').focus());
}
function closePause(e) {
  ((G.paused = !1),
    showCfg(!1),
    ($('#menu').hidden = !0),
    document.activeElement && document.activeElement.blur && document.activeElement.blur(),
    updateTouchUI(),
    e && lockPointer());
}
function showCfg(e) {
  (($('#cfg').hidden = !e), $('#cfgBtn').setAttribute('aria-expanded', e ? 'true' : 'false'));
}
function initMenu() {
  (($('#nick').value = G.name),
    $('#nick').addEventListener('input', e => {
      ((e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9\-_ ]/g, '')),
        (G.name = (e.target.value.trim() || 'AL-07').slice(0, 12)),
        savePrefs(),
        renderMenu());
    }),
    $('#code').addEventListener(
      'input',
      e => (e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    ),
    $('#code').addEventListener('keydown', e => 'Enter' === e.key && go('join')));
  for (const e of document.querySelectorAll('#menu .tabs button')) e.onclick = () => showView(e.dataset.tab);
  const e = e => {
    ((G.botCount = clamp(G.botCount + e, 0, 11)), renderMenu());
  };
  (($('#botsDn').onclick = () => e(-1)),
    ($('#botsUp').onclick = () => e(1)),
    ($('#go').onclick = () => go(G.menuMode || 'solo')),
    ($('#resume').onclick = () => closePause(!0)),
    ($('#leave').onclick = () => leaveGame()),
    ($('#fs').onclick = () => goFullscreen()),
    ($('#cfgBtn').onclick = () => showCfg($('#cfg').hidden)),
    ($('#cfgClose').onclick = () => showCfg(!1)),
    addEventListener('keydown', e => {
      'Escape' !== e.key ||
        $('#cfg').hidden ||
        ('menu' !== G.mode && !G.paused) ||
        (e.stopImmediatePropagation(), showCfg(!1));
    }),
    ($('#menu .side').onclick = () => inPause() && closePause(!0)),
    ($('#copyCode').onclick = () => {
      const e = NET.code,
        t = $('#copyCode'),
        o = e => {
          ((t.textContent = e), setTimeout(() => (t.textContent = 'Copiar código'), 1600));
        };
      try {
        navigator.clipboard.writeText(e).then(
          () => o('Copiado'),
          () => o(e)
        );
      } catch (t) {
        o(e);
      }
    }));
}
function showBoot(e, t) {
  const o = $('#boot');
  ((o.hidden = !e), t && (o.querySelector('div').childNodes[1].textContent = t));
}
function switchPreview(e) {
  (showBoot(!0, 'Cargando ' + MAPS[e].name),
    setTimeout(() => {
      (loadMap(e),
        buildMinimap(),
        AU.ctx && (setReverb(LV.post.reverb), startAmbience()),
        (G.pv = 0),
        (G.pvT = 0),
        showBoot(!1));
    }, 40));
}
function applyQuality() {
  if (QUALITY[G.quality] === Q) return;
  const e = Q;
  if (((Q = QUALITY[G.quality]), resize(), e.tex !== Q.tex)) {
    for (const e in TEX) {
      const t = TEX[e];
      (t.map.dispose(), t.normalMap.dispose(), t.rm.dispose(), delete TEX[e]);
    }
    for (const e in MATS) (MATS[e].dispose(), delete MATS[e]);
    (photoMats(), (LV.mapKey = null));
  } else
    LV.sun &&
      (LV.sun.shadow.mapSize.set(Q.shadow, Q.shadow),
      LV.sun.shadow.map && (LV.sun.shadow.map.dispose(), (LV.sun.shadow.map = null)));
}
