/* Datos: armas, clases, trajes, modos y sensaciones */
const WEAPONS = {
  rifle: {
    name: 'Fusil de asalto 5,56',
    rpm: 720,
    auto: 1,
    dmg: 30,
    hs: 3.6,
    mag: 30,
    res: 150,
    spread: 0.02,
    ads: 0.0025,
    rec: 0.011,
    recY: 0.004,
    reload: 2.3,
    r0: 35,
    r1: 80,
    min: 0.65,
    fov: 54,
    snd: 'rifle',
    sight: 'holo',
    kick: 0.03
  },
  dmr: {
    name: 'Fusil tirador 7,62',
    rpm: 330,
    auto: 0,
    dmg: 54,
    hs: 2.2,
    mag: 20,
    res: 80,
    spread: 0.03,
    ads: 0.0012,
    rec: 0.022,
    recY: 0.006,
    reload: 2.6,
    r0: 60,
    r1: 140,
    min: 0.8,
    fov: 28,
    snd: 'dmr',
    sight: 'scope',
    scope: 1,
    kick: 0.045
  },
  shotgun: {
    name: 'Escopeta de corredera 12',
    rpm: 70,
    auto: 0,
    dmg: 15,
    pel: 9,
    hs: 3,
    mag: 7,
    res: 35,
    spread: 0.06,
    ads: 0.042,
    rec: 0.05,
    recY: 0.012,
    reload: 0.5,
    shell: 1,
    r0: 7,
    r1: 22,
    min: 0.25,
    fov: 60,
    snd: 'shotgun',
    sight: 'iron',
    kick: 0.07
  },
  smg: {
    name: 'Subfusil 9 mm',
    rpm: 880,
    auto: 1,
    dmg: 22,
    hs: 3.2,
    mag: 32,
    res: 192,
    spread: 0.026,
    ads: 0.006,
    rec: 0.008,
    recY: 0.005,
    reload: 1.9,
    r0: 15,
    r1: 45,
    min: 0.6,
    fov: 58,
    snd: 'smg',
    sight: 'holo',
    kick: 0.022
  },
  sniper: {
    name: 'Fusil de cerrojo ,338',
    rpm: 45,
    auto: 0,
    dmg: 120,
    hs: 2,
    mag: 5,
    res: 30,
    spread: 0.1,
    ads: 0,
    rec: 0.06,
    recY: 0.01,
    reload: 3.2,
    r0: 150,
    r1: 300,
    min: 0.9,
    fov: 13,
    snd: 'sniper',
    sight: 'scope',
    scope: 1,
    bolt: 1,
    kick: 0.09
  }
};
for (const e in WEAPONS) WEAPONS[e].key = e;
const CLASSES = [
    {
      id: 'asalto',
      name: 'Asalto',
      w: 'rifle',
      desc: 'Fusil automático con visor holográfico. Rinde a cualquier distancia media.',
      ab: [
        { id: 'stim', name: 'Estimulante', desc: '+40 de vida y 25 % más de velocidad durante 6 s.', cd: 25 },
        { id: 'frag', name: 'Granada de fragmentación', desc: 'Detona a los 2,2 s. Radio letal de 5 m.', cd: 20 }
      ]
    },
    {
      id: 'recon',
      name: 'Reconocimiento',
      w: 'dmr',
      desc: 'Fusil semiautomático con mira de 3 aumentos. Controla líneas largas.',
      ab: [
        {
          id: 'pulse',
          name: 'Pulso de radar',
          desc: 'Marca a todos los hostiles durante 6 s, a través de paredes.',
          cd: 30
        },
        { id: 'thermal', name: 'Visión térmica', desc: 'Imagen térmica durante 10 s. Los cuerpos brillan.', cd: 28 }
      ]
    },
    {
      id: 'breacher',
      name: 'Brecha',
      w: 'shotgun',
      desc: 'Escopeta de corredera para entradas en interiores y pasillos.',
      ab: [
        {
          id: 'flash',
          name: 'Granada cegadora',
          desc: 'Ciega y ensordece a quien la mire. 1,5 s de espoleta.',
          cd: 18
        },
        { id: 'plate', name: 'Placa balística', desc: '+60 de blindaje que absorbe daño antes que la vida.', cd: 35 }
      ]
    },
    {
      id: 'medico',
      name: 'Sanitario',
      w: 'smg',
      desc: 'Subfusil de cadencia muy alta y movilidad extra.',
      ab: [
        { id: 'regen', name: 'Autoinyector', desc: 'Recupera 10 de vida por segundo durante 8 s.', cd: 25 },
        { id: 'medkit', name: 'Botiquín', desc: 'Vida completa al instante.', cd: 40 }
      ]
    },
    {
      id: 'tirador',
      name: 'Francotirador',
      w: 'sniper',
      desc: 'Cerrojo de un disparo, mira de 8 aumentos. Mata de un impacto al torso.',
      ab: [
        {
          id: 'nvg',
          name: 'Visión nocturna',
          desc: 'Amplificación de luz durante 15 s. Ideal en el instituto.',
          cd: 20
        },
        { id: 'sensor', name: 'Sensor cardiaco', desc: 'Detecta latidos a 30 m durante 10 s.', cd: 25 }
      ]
    }
  ],
  SUITS = [
    [4015413, 5593406],
    [3028288, 3949906],
    [4340272, 5918524],
    [3618095, 4868672],
    [2763822, 3882298]
  ],
  BOTW = {
    sniper: { dmg: [85, 110], burst: [1, 1], int: 1, pause: 1.4, range: 130, snd: 'sniper', pref: [15, 60] },
    knife: { dmg: [100, 100], burst: [1, 1], int: 0.7, pause: 0, range: 1.9, snd: 'knife', pref: [0, 1.2], melee: 1 },
    rifle: { dmg: [13, 18], burst: [3, 6], int: 0.11, pause: 0, range: 75, snd: 'rifle' },
    smg: { dmg: [10, 14], burst: [4, 8], int: 0.075, pause: 0, range: 40, snd: 'smg' },
    shotgun: { dmg: [30, 48], burst: [1, 1], int: 1, pause: 0.3, range: 22, snd: 'shotgun' },
    dmr: { dmg: [26, 34], burst: [1, 2], int: 0.4, pause: 0.2, range: 90, snd: 'dmr' }
  };
((WEAPONS.pistol = {
  key: 'pistol',
  name: 'Pistola 9 mm',
  rpm: 420,
  auto: 0,
  dmg: 34,
  hs: 3,
  mag: 15,
  res: 60,
  spread: 0.022,
  ads: 0.004,
  rec: 0.02,
  recY: 0.006,
  reload: 1.5,
  r0: 15,
  r1: 40,
  min: 0.6,
  fov: 62,
  snd: 'smg',
  sight: 'iron',
  kick: 0.035
}),
  (WEAPONS.knife = {
    key: 'knife',
    name: 'Cuchillo de combate',
    melee: 1,
    rpm: 90,
    dmg: 100,
    hs: 1,
    mag: 0,
    res: 0,
    spread: 0,
    ads: 0,
    rec: 0,
    recY: 0,
    reload: 0,
    r0: 1,
    r1: 2,
    min: 1,
    fov: 74,
    snd: 'knife',
    kick: 0
  }),
  (BOTW.pistol = { dmg: [12, 16], burst: [1, 2], int: 0.25, pause: 0.2, range: 45, snd: 'smg' }));
const GG = ['pistol', 'smg', 'shotgun', 'rifle', 'dmr', 'sniper', 'smg', 'shotgun', 'rifle', 'dmr', 'sniper', 'knife'],
  WLIST = ['rifle', 'smg', 'shotgun', 'dmr', 'sniper', 'pistol', 'knife'],
  BOT_NAMES = [
    'Grajo',
    'Sombra',
    'Tejón',
    'Cuervo',
    'Lince',
    'Zorro',
    'Halcón',
    'Lobo',
    'Víbora',
    'Búho',
    'Jabalí',
    'Gato'
  ],
  MODES = {
    ffa: {
      name: 'Todos contra todos',
      meta: '30 bajas',
      desc: 'Cada uno a lo suyo. Gana el primero que llegue a 30 bajas.',
      limit: 30
    },
    tdm: {
      name: 'Deathmatch por equipos',
      meta: '40 bajas',
      desc: 'SWAT (jugadores) contra la unidad de máscaras de gas. Gana el primer equipo en llegar a 40.',
      limit: 40
    },
    gun: {
      name: 'Juego de armas',
      meta: '12 bajas',
      desc: 'Empiezas con pistola y cada baja te cambia de arma: dos vueltas a subfusil, escopeta, fusil, tirador y francotirador, y al final cuchillo. La baja con cuchillo gana. Sin rachas ni habilidades.',
      limit: 12
    }
  },
  TEAMN = { A: 'SWAT', B: 'Máscaras de gas' },
  FEEL = {
    bobUp: 0.038,
    bobSide: 0.018,
    bobRoll: 0.008,
    strafeRoll: 0.005,
    sprintBob: 0.4,
    swayX: 7e-4,
    swayY: 0.0011,
    lagYaw: 0.068,
    lagYawMax: 0.28,
    lagPitch: 0.09,
    lagPitchMax: 0.34,
    lagSpringX: 50,
    lagDampX: 14,
    lagSpringY: 36,
    lagDampY: 12,
    lagShiftX: 0.075,
    lagShiftY: 0.11,
    lagAds: 0.8
  };
