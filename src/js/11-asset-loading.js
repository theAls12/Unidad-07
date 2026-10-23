/* Lectura de los recursos embebidos (base64 → buffers, GLTFLoader) */
function b64buf(e) {
  if (e instanceof ArrayBuffer) return e;
  const t = atob(e),
    o = new Uint8Array(t.length);
  for (let e = 0; e < t.length; e++) o[e] = t.charCodeAt(e);
  return o.buffer;
}
function isWebp(e) {
  return e instanceof ArrayBuffer ? 'RIFF' === String.fromCharCode(...new Uint8Array(e, 0, 4)) : e.startsWith('UklGR');
}
function b64blob(e, t) {
  return new Blob([b64buf(e)], { type: t });
}
function gltfLoader() {
  const e = new THREE.GLTFLoader();
  return ('undefined' != typeof MeshoptDecoder && e.setMeshoptDecoder && e.setMeshoptDecoder(MeshoptDecoder), e);
}
let maxAniso = 4;
