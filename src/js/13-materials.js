/* Materiales */
const MATDEF = {
    concrete: { t: 'concrete', tile: 3, nt: 'free', surf: 'concrete' },
    paint: { t: 'paint', tile: 3.4, nt: 'u', surf: 'concrete' },
    lino: { t: 'lino', tile: 2.4, nt: 0.25, surf: 'tile' },
    ceiling: { t: 'ceiling', tile: 1.2, nt: 0.5, surf: 'concrete' },
    locker: { t: 'locker', tile: 1.9, nt: 'macro', surf: 'metal' },
    brick: { t: 'brick', tile: 2, nt: 'macro', surf: 'concrete' },
    asphalt: { t: 'asphalt', tile: 4, nt: 'free', surf: 'concrete' },
    wood: { t: 'woodfloor', tile: 2.5, nt: 'macro', surf: 'wood' },
    logs: { t: 'logs', tile: 2.4, nt: 'macro', surf: 'wood' },
    planks: { t: 'planks', tile: 1.6, nt: 'macro', surf: 'wood' },
    bark: { t: 'bark', tile: 1.4, nt: 'free', surf: 'wood' },
    ground: { t: 'ground', tile: 5, nt: 'free', surf: 'dirt' },
    sand: { t: 'sand', tile: 5, nt: 'free', surf: 'sand' },
    adobe: { t: 'adobe', tile: 3.2, nt: 'free', surf: 'concrete' },
    adobe2: { t: 'adobe', tile: 3.2, nt: 'free', surf: 'concrete', color: 14206132 },
    rust: { t: 'rust', tile: 1.5, nt: 'free', surf: 'metal' },
    corr: { t: 'corr', tile: 1.5, nt: 'macro', surf: 'metal' },
    rock: { t: 'rock', tile: 2, nt: 'free', surf: 'concrete' },
    chalk: { t: 'chalk', tile: 3, nt: 'macro', surf: 'concrete' },
    gunmetal: { t: 'gunmetal', tile: 0.3, surf: 'metal' },
    polymer: { t: 'polymer', tile: 0.25, surf: 'metal' },
    needles: { t: 'needles', tile: 1.5, nt: 'free', surf: 'dirt', vc: !0 },
    clothRed: { t: 'cloth', tile: 1, surf: 'dirt', color: 9058860, ds: 1 },
    clothBlue: { t: 'cloth', tile: 1, surf: 'dirt', color: 3428459, ds: 1 },
    clothKhaki: { t: 'cloth', tile: 0.8, surf: 'dirt', color: 10127970, ds: 1 },
    mattress: { t: 'cloth', tile: 1, surf: 'dirt', color: 9406064, ds: 1 }
  },
  MATS = {};
function stdMat(e, t = {}) {
  const o = new THREE.MeshStandardMaterial({
    map: e.map,
    normalMap: e.normalMap,
    roughnessMap: e.rm,
    roughness: 1,
    metalness: e.metal ? 1 : 0,
    metalnessMap: e.metal ? e.rm : null,
    color: void 0 !== t.color ? t.color : 16777215,
    vertexColors: !!t.vc
  });
  return (o.color.convertSRGBToLinear(), t.ns && o.normalScale.set(t.ns, t.ns), t.ds && (o.side = THREE.DoubleSide), o);
}
function M(e) {
  if (MATS[e]) return MATS[e];
  const t = MATDEF[e],
    o = stdMat(genPBR(t.t), t);
  return ((o.userData.tile = t.tile), (o.userData.surf = t.surf), noTile(o, t.nt), (MATS[e] = o));
}
const HEAT = [];
function fabricMat(e, t = !0) {
  const o = stdMat(genPBR('fabric'), { color: e });
  return ((o.emissive = new THREE.Color(16777215)), (o.emissiveIntensity = 0), t && HEAT.push(o), o);
}
