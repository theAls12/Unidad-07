/* Entrada: teclado, ratón, mando y táctil */
function setupInput() {
  (addEventListener('keydown', e => {
    if ('play' === G.mode)
      if ('Tab' !== e.code) {
        if ('Escape' === e.code || 'KeyP' === e.code) {
          if ((e.preventDefault(), e.repeat)) return;
          return (
            G.tabOpen && closeTab(!1),
            void (G.paused
              ? performance.now() - (G.pauseAt || 0) > 350 && closePause(!0)
              : document.pointerLockElement === $('#gl')
                ? document.exitPointerLock()
                : openPause())
          );
        }
        ((e.ctrlKey || e.metaKey) && e.preventDefault(),
          e.repeat ||
            ((KEYS[e.code] = !0),
            'KeyE' === e.code && tryPickup(),
            'KeyR' === e.code && startReload(),
            'KeyQ' === e.code && useAbility(),
            'KeyL' === e.code && toggleLight(),
            'KeyF' === e.code && doMelee(),
            'Digit1' === e.code && switchSlot(0),
            'Digit2' === e.code && switchSlot(1),
            'Digit3' === e.code && switchSlot(2),
            'Digit4' === e.code && deployStreak('uav'),
            'Digit5' === e.code && deployStreak('turret'),
            'Digit6' === e.code && deployStreak('dogs'),
            'KeyC' === e.code && e.ctrlKey));
      } else {
        if ((e.preventDefault(), e.repeat)) return;
        if (NET.host && !G.noLock)
          if (G.tabOpen) closeTab(!0);
          else {
            ((G.tabOpen = !0), ($('#score').hidden = !1), renderScore());
            try {
              document.exitPointerLock();
            } catch (e) {}
          }
        else (($('#score').hidden = !1), renderScore());
      }
  }),
    addEventListener('keyup', e => {
      ((KEYS[e.code] = !1), 'Tab' !== e.code || G.tabOpen || ($('#score').hidden = !0));
    }),
    addEventListener('beforeunload', e => {
      'play' === G.mode && (e.preventDefault(), (e.returnValue = ''));
    }),
    addEventListener('blur', () => {
      for (const e in KEYS) KEYS[e] = !1;
      MOUSE.l = MOUSE.r = !1;
    }));
  const e = $('#gl');
  (addEventListener('mousemove', t => {
    'play' !== G.mode ||
      G.paused ||
      (document.pointerLockElement !== e && !G.noLock) ||
      ((MOUSE.dx += t.movementX || 0), (MOUSE.dy += t.movementY || 0));
  }),
    addEventListener('mousedown', t => {
      'play' !== G.mode ||
        G.paused ||
        (t.target.closest && t.target.closest('button')) ||
        (0 === t.button && (MOUSE.l = !0),
        2 === t.button && (MOUSE.r = !0),
        G.noLock || document.pointerLockElement === e || lockPointer());
    }),
    addEventListener('mouseup', e => {
      (0 === e.button && (MOUSE.l = !1), 2 === e.button && (MOUSE.r = !1));
    }),
    addEventListener('contextmenu', e => {
      'play' === G.mode && e.preventDefault();
    }),
    document.addEventListener('pointerlockchange', () => {
      'play' === G.mode &&
        (document.pointerLockElement === e
          ? (closePause(!1), G.tabOpen && ((G.tabOpen = !1), ($('#score').hidden = !0)))
          : G.tabOpen
            ? (MOUSE.l = MOUSE.r = !1)
            : G.devSwitch
              ? (G.devSwitch = !1)
              : G.noLock || 'kb' !== G.input || openPause());
    }),
    document.addEventListener('pointerlockerror', lockFailed));
}
function goFullscreen() {
  try {
    const e = document.documentElement.requestFullscreen();
    e &&
      e.then &&
      e.then(
        () => {
          try {
            navigator.keyboard && navigator.keyboard.lock && navigator.keyboard.lock().catch(() => {});
          } catch (e) {}
        },
        () => {}
      );
  } catch (e) {}
}
function closeTab(e) {
  ((G.tabOpen = !1), ($('#score').hidden = !0), e && lockPointer());
}
function lockPointer() {
  if (G.noLock || 'kb' !== G.input) return;
  const e = $('#gl');
  if (e.requestPointerLock)
    try {
      const t = e.requestPointerLock();
      t && t.catch && t.catch(lockFailed);
    } catch (e) {
      lockFailed();
    }
  else G.noLock = !0;
}
function lockFailed() {
  navigator.webdriver
    ? (G.noLock = !0)
    : 'play' !== G.mode ||
      G.noLock ||
      'kb' !== G.input ||
      (openPause(), ($('#pauseNote').textContent = 'El navegador necesita un segundo: pulsa Continuar otra vez.'));
}
const PAD = { mx: 0, my: 0, sprint: !1, crouch: !1 },
  GLYPH = {
    kb: {
      reload: 'R',
      pickup: 'E',
      ability: 'Q',
      uav: '4',
      turret: '5',
      dogs: '6',
      melee: 'F',
      light: 'L',
      score: 'Tab',
      pause: 'Esc · P'
    },
    pad: {
      reload: 'X',
      pickup: 'Mantén X',
      ability: 'LB',
      uav: '↑',
      turret: '→',
      dogs: '←',
      melee: 'RB',
      light: '↓',
      score: 'View',
      pause: 'Menu'
    },
    touch: {}
  },
  glyph = e => (GLYPH[G.input] || {})[e] || '',
  kbd = e => (glyph(e) ? `<kbd>${glyph(e)}</kbd>` : ''),
  CONTROLS = {
    kb: [
      ['WASD', 'moverse'],
      ['Ratón', 'apuntar · disparar'],
      ['Clic der.', 'mira'],
      ['Shift', 'correr'],
      ['Ctrl · C', 'agacharse'],
      ['Espacio', 'saltar'],
      ['R', 'recargar'],
      ['E', 'recoger arma'],
      ['1 2 3', 'armas'],
      ['F', 'golpe'],
      ['Q', 'habilidad'],
      ['4 5 6', 'rachas (3 · 6 · 10)'],
      ['L', 'linterna'],
      ['Tab', 'marcador · bots'],
      ['Esc · P', 'pausa']
    ],
    pad: [
      ['LS', 'moverse'],
      ['RS', 'apuntar'],
      ['LT', 'mira'],
      ['RT', 'disparar'],
      ['L3', 'correr'],
      ['B', 'agacharse'],
      ['A', 'saltar'],
      ['X', 'recargar'],
      ['Mantén X', 'recoger arma'],
      ['Y', 'cambiar arma'],
      ['RB · R3', 'golpe'],
      ['LB', 'habilidad'],
      ['↑ → ←', 'rachas'],
      ['↓', 'linterna'],
      ['View', 'marcador'],
      ['Menu', 'pausa'],
      ['LB · RB', 'pestañas del menú']
    ],
    touch: [
      ['Izquierda', 'arrastra para moverte (al fondo corres)'],
      ['Derecha', 'arrastra para apuntar'],
      ['Fuego', 'mantén para disparar (también apunta)'],
      ['Mira', 'toca para apuntar'],
      ['Botones', 'saltar, agacharse, recargar, arma, golpe, habilidad'],
      ['Aviso', 'toca para recoger armas']
    ]
  };
function renderControls() {
  const e = $('#keysList');
  if (e) {
    e.innerHTML = '';
    for (const [t, o] of CONTROLS[G.input] || CONTROLS.kb) {
      const n = document.createElement('div'),
        a = document.createElement('kbd');
      ((a.textContent = t), n.append(a, o), e.append(n));
    }
    $('#ctrlDev').textContent = { kb: 'Teclado y ratón', pad: 'Mando', touch: 'Pantalla táctil' }[G.input];
  }
}
function setInput(e) {
  G.input !== e &&
    ((G.input = e),
    (document.body.dataset.input = e),
    'kb' !== e && document.pointerLockElement && ((G.devSwitch = !0), document.exitPointerLock()),
    renderControls(),
    'play' === G.mode && (hudKit(), updateStreakHud()),
    ($('#ability kbd').textContent = glyph('ability')),
    updateTouchUI());
}
let padPrev = [],
  padX = 0,
  padNav = 0;
const capture = (e, t) => {
    try {
      e.setPointerCapture(t.pointerId);
    } catch (e) {}
  },
  padCurve = e => Math.sign(e) * Math.pow(Math.abs(e), 1.7);
function pollPad(e) {
  const t = navigator.getGamepads ? Array.from(navigator.getGamepads()).find(e => e && e.connected) : null;
  if (!t) return void ('pad' === G.input && (PAD.mx = PAD.my = 0));
  const o = t.buttons.map(e => !(!e || !(e.pressed || e.value > 0.4))),
    n = e => {
      const o = t.axes[e] || 0;
      return Math.abs(o) < 0.16 ? 0 : (o - 0.16 * Math.sign(o)) / 0.84;
    };
  if (((o.some(Boolean) || t.axes.some(e => Math.abs(e) > 0.5)) && setInput('pad'), 'pad' !== G.input))
    return void (padPrev = o);
  const a = e => o[e] && !padPrev[e],
    r = e => !o[e] && padPrev[e];
  if ('menu' === G.mode || G.paused) ((PAD.mx = PAD.my = 0), menuPad(a, n, o, e));
  else if ('play' === G.mode) {
    if (
      ((PAD.mx = n(0)),
      (PAD.my = n(1)),
      (MOUSE.dx += 1500 * padCurve(n(2)) * e),
      (MOUSE.dy += 1100 * padCurve(n(3)) * e),
      o[7] !== !!padPrev[7] && (MOUSE.l = o[7]),
      o[6] !== !!padPrev[6] && (MOUSE.r = o[6]),
      a(0) && (KEYS.Space = !0),
      r(0) && (KEYS.Space = !1),
      a(1) && (PAD.crouch = !PAD.crouch),
      a(10) && ((PAD.sprint = !0), (PAD.crouch = !1)),
      PAD.my > -0.3 && (PAD.sprint = !1),
      a(2) && (padX = 0),
      o[2] && padX >= 0 && ((padX += e), padX > 0.35 && (tryPickup(), (padX = -1))),
      r(2) && padX >= 0 && startReload(),
      a(3))
    ) {
      const e = slotKeys();
      for (let t = 1; t <= 3; t++) {
        const o = ((P.slot || 0) + t) % 3;
        if (e[o]) {
          switchSlot(o);
          break;
        }
      }
    }
    (a(4) && useAbility(),
      (a(5) || a(11)) && doMelee(),
      a(12) && deployStreak('uav'),
      a(15) && deployStreak('turret'),
      a(14) && deployStreak('dogs'),
      a(13) && toggleLight(),
      a(8) && (($('#score').hidden = !1), renderScore(!0)),
      r(8) && ($('#score').hidden = !0),
      a(9) && openPause());
  }
  padPrev = o;
}
function menuFocusables() {
  const e = $('#cfg').hidden ? $('#menu') : $('#cfg');
  return Array.from(e.querySelectorAll('button, input')).filter(
    t => !(t.disabled || null === t.offsetParent || (e === $('#menu') && $('#cfg').contains(t)))
  );
}
function menuPad(e, t, o, n) {
  if ($('#menu').hidden) return;
  const a = menuFocusables();
  if (!a.length) return;
  let r = document.activeElement;
  a.includes(r) || (r = null);
  let s = (o[15] ? 1 : 0) - (o[14] ? 1 : 0) + t(0),
    l = (o[13] ? 1 : 0) - (o[12] ? 1 : 0) + t(1);
  if ((Math.abs(s) < 0.5 && (s = 0), Math.abs(l) < 0.5 && (l = 0), (padNav -= n), s || l)) {
    if (padNav <= 0) {
      if (((padNav = padNav < -0.05 ? 0.32 : 0.14), r)) {
        const e = r.getBoundingClientRect(),
          t = e.left + e.width / 2,
          o = e.top + e.height / 2;
        let n = null,
          i = 1e9;
        for (const e of a) {
          if (e === r) continue;
          const a = e.getBoundingClientRect(),
            c = a.left + a.width / 2 - t,
            d = a.top + a.height / 2 - o,
            u = s ? c * Math.sign(s) : d * Math.sign(l),
            p = s ? Math.abs(d) : Math.abs(c);
          if (u <= 2) continue;
          const m = u + 2.2 * p;
          m < i && ((i = m), (n = e));
        }
        n && (r = n);
      } else r = a.find(e => 'resume' === e.id || 'go' === e.id) || a[0];
      (r.focus({ preventScroll: !0 }), r.scrollIntoView({ block: 'nearest' }));
    }
  } else padNav = -1;
  if ((e(0) && r && r.click(), e(1) && ($('#cfg').hidden ? G.paused && closePause(!1) : showCfg(!1)), e(4) || e(5))) {
    const e = ['match', 'op'],
      t = G.paused ? G.pauseView || 'op' : G.menuView || 'match';
    showView(e[(e.indexOf(t) + 1) % 2]);
  }
  (e(3) && showCfg($('#cfg').hidden), e(9) && (G.paused ? closePause(!1) : 'menu' === G.mode && $('#go').click()));
}
const TOUCH_BTNS = [
  ['fire', 'Fuego'],
  ['ads', 'Mira'],
  ['jump', 'Saltar'],
  ['crouch', 'Agachar'],
  ['reload', 'Recargar'],
  ['swap', 'Arma'],
  ['melee', 'Golpe'],
  ['ability', 'Habilidad'],
  ['uav', 'UAV'],
  ['turret', 'Torreta'],
  ['dogs', 'K9'],
  ['light', 'Luz'],
  ['score', 'Marcador'],
  ['pause', 'II']
];
function toggleLight() {
  ((G.flashlight = !G.flashlight), AU.ctx && click(AU.ctx.currentTime, 2500, 0.02, 0.4));
}
function touchAct(e, t) {
  if ('play' === G.mode && !G.paused && ('fire' === e && (MOUSE.l = t), t)) {
    if (
      ('ads' === e && (MOUSE.r = !MOUSE.r),
      'jump' === e && (KEYS.Space = !0),
      'crouch' === e && (PAD.crouch = !PAD.crouch),
      'reload' === e && startReload(),
      'swap' === e)
    ) {
      const e = slotKeys();
      for (let t = 1; t <= 3; t++) {
        const o = ((P.slot || 0) + t) % 3;
        if (e[o]) {
          switchSlot(o);
          break;
        }
      }
    }
    if (
      ('melee' === e && doMelee(),
      'ability' === e && useAbility(),
      ('uav' !== e && 'turret' !== e && 'dogs' !== e) || deployStreak(e),
      'light' === e && toggleLight(),
      'score' === e)
    ) {
      const e = $('#score');
      ((e.hidden = !e.hidden), e.hidden || renderScore(!0));
    }
    'pause' === e && openPause();
  }
}
function initTouch() {
  const e = document.createElement('div');
  ((e.id = 'touch'),
    (e.hidden = !0),
    (e.innerHTML =
      '<div class="tzone tl" id="tMove"><div class="stick" hidden><i></i></div></div><div class="tzone tr" id="tLook"></div>' +
      TOUCH_BTNS.map(([e, t]) => `<button type="button" class="tb t-${e}" data-a="${e}">${t}</button>`).join('') +
      '<div id="rotate">Gira el móvil para jugar</div>'),
    document.body.append(e));
  const t = e.querySelector('.stick'),
    o = t.querySelector('i');
  let n = null;
  const a = new Map(),
    r = $('#tMove');
  (r.addEventListener('pointerdown', e => {
    (capture(r, e),
      (n = { id: e.pointerId, x: e.clientX, y: e.clientY }),
      (t.hidden = !1),
      (t.style.left = e.clientX + 'px'),
      (t.style.top = e.clientY + 'px'));
  }),
    r.addEventListener('pointermove', e => {
      if (!n || e.pointerId !== n.id) return;
      let t = (e.clientX - n.x) / 60,
        a = (e.clientY - n.y) / 60;
      const r = Math.hypot(t, a);
      (r > 1 && ((t /= r), (a /= r)),
        (PAD.mx = t),
        (PAD.my = a),
        (PAD.sprint = r > 1.35 && a < -0.7),
        PAD.sprint && (PAD.crouch = !1),
        (o.style.transform = `translate(${38 * t}px,${38 * a}px)`));
    }));
  const s = e => {
    n &&
      e.pointerId === n.id &&
      ((n = null), (PAD.mx = PAD.my = 0), (PAD.sprint = !1), (t.hidden = !0), (o.style.transform = ''));
  };
  (r.addEventListener('pointerup', s), r.addEventListener('pointercancel', s));
  const l = e => a.set(e.pointerId, [e.clientX, e.clientY]),
    i = e => {
      const t = a.get(e.pointerId);
      t &&
        !G.paused &&
        ((MOUSE.dx += 1.3 * (e.clientX - t[0])),
        (MOUSE.dy += 1.3 * (e.clientY - t[1])),
        (t[0] = e.clientX),
        (t[1] = e.clientY));
    },
    c = e => a.delete(e.pointerId),
    d = $('#tLook');
  (d.addEventListener('pointerdown', e => {
    (capture(d, e), l(e));
  }),
    d.addEventListener('pointermove', i),
    d.addEventListener('pointerup', c),
    d.addEventListener('pointercancel', c));
  for (const t of e.querySelectorAll('.tb')) {
    const e = t.dataset.a;
    (t.addEventListener('pointerdown', o => {
      (o.preventDefault(), capture(t, o), t.classList.add('on'), 'fire' === e && l(o), touchAct(e, !0));
    }),
      'fire' === e && t.addEventListener('pointermove', i));
    const o = o => {
      (t.classList.remove('on'), 'fire' === e && c(o), touchAct(e, !1), 'jump' === e && (KEYS.Space = !1));
    };
    (t.addEventListener('pointerup', o), t.addEventListener('pointercancel', o));
  }
  ($('#prompt').addEventListener('click', () => 'touch' === G.input && tryPickup()),
    e.addEventListener('contextmenu', e => e.preventDefault()));
}
function updateTouchUI() {
  const e = $('#touch');
  if (!e) return;
  if (((e.hidden = !('touch' === G.input && 'play' === G.mode && !G.paused)), e.hidden)) return;
  const t = 'gun' === G.gm,
    o = (t, o) => e.querySelector('.t-' + t).classList.toggle('off', !o);
  (o('uav', !t && G.earned.uav),
    o('turret', !t && G.earned.turret),
    o('dogs', !t && G.earned.dogs),
    o('ability', !t && G.abCD <= 0),
    o('swap', !t),
    e.querySelector('.t-ads').classList.toggle('act', !!MOUSE.r));
}
function initDevices() {
  initTouch();
  const e = matchMedia && matchMedia('(pointer: coarse)').matches && 'ontouchstart' in window;
  ((G.input = null),
    setInput(e ? 'touch' : 'kb'),
    addEventListener('keydown', () => setInput('kb'), !0),
    addEventListener(
      'pointerdown',
      e => setInput('touch' === e.pointerType || 'pen' === e.pointerType ? 'touch' : 'kb'),
      !0
    ),
    addEventListener(
      'pointermove',
      e => 'mouse' === e.pointerType && Math.abs(e.movementX) + Math.abs(e.movementY) > 6 && setInput('kb'),
      !0
    ),
    addEventListener('gamepadconnected', () => center('MANDO CONECTADO', 'Menu: pausa · View: marcador')));
}
