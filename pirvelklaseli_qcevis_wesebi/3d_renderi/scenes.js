import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const SIZE = 1200;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(SIZE, SIZE);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

scene.add(new THREE.HemisphereLight(0xfff6ea, 0xb8c4d8, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.position.set(5, 9, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
sun.shadow.radius = 6;
sun.shadow.bias = -0.0005;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.8);
fill.position.set(-6, 4, 3);
scene.add(fill);

// ---------- helpers ----------
const mat = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, ...o });
function mesh(geo, c, o) {
  const m = new THREE.Mesh(geo, c instanceof THREE.Material ? c : mat(c, o));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
const at = (obj, x = 0, y = 0, z = 0) => { obj.position.set(x, y, z); return obj; };
const rot = (obj, x = 0, y = 0, z = 0) => { obj.rotation.set(x, y, z); return obj; };
const rbox = (w, h, d, r, c, o) => mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2) * 0.999), c, o);
const sph = (r, c, o) => mesh(new THREE.SphereGeometry(r, 48, 32), c, o);
const cyl = (rt, rb, h, c, seg = 48, o) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c, o);
const cap = (r, l, c) => mesh(new THREE.CapsuleGeometry(r, l, 12, 32), c);
const group = (...kids) => { const g = new THREE.Group(); kids.forEach(k => g.add(k)); return g; };
const add = (...o) => o.forEach(x => scene.add(x));

function platform(c = '#CFE6DF') {
  const g = group(at(cyl(3.3, 3.3, 0.4, c, 96), 0, -0.2, 0));
  const rim = mesh(new THREE.TorusGeometry(3.3, 0.2, 24, 128), c);
  rim.rotation.x = Math.PI / 2; rim.position.y = -0.2; g.add(rim);
  g.add(at(cyl(3.0, 3.3, 0.6, c, 96), 0, -0.55, 0));
  return g;
}

function textTex(lines, { w = 512, h = 512, bg = '#2E5E4E', fg = '#F5F2E8', size = 120, font = 'bold' } = {}) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const x = cv.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `${font} ${size}px DejaVu Sans, sans-serif`;
  lines.forEach((l, i) => x.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.15));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function kid({ shirt = '#4C7BD9', pants = '#2F3E66', hair = '#5A3A22', skin = '#F3C9A3', girl = false, armL = 0.25, armR = 0.25, shoes = '#E9EEF5', scale = 1 } = {}) {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    g.add(at(cap(0.15, 0.42, pants), s * 0.18, 0.4, 0));
    g.add(at(rbox(0.3, 0.16, 0.42, 0.07, shoes), s * 0.18, 0.08, 0.06));
  }
  if (girl) g.add(at(cyl(0.34, 0.62, 0.55, shirt), 0, 0.8, 0));
  g.add(at(cap(0.4, 0.42, shirt), 0, 1.12, 0));
  g.add(at(sph(0.54, skin), 0, 2.08, 0));
  const hairCap = mesh(new THREE.SphereGeometry(0.575, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52), hair);
  hairCap.position.set(0, 2.1, -0.04); hairCap.rotation.x = -0.35; g.add(hairCap);
  if (girl) for (const s of [-1, 1]) g.add(at(sph(0.2, hair), s * 0.56, 2.05, -0.12), at(sph(0.08, '#F06C8C'), s * 0.5, 2.22, -0.02));
  for (const s of [-1, 1]) {
    g.add(at(sph(0.065, '#2A2230', { roughness: 0.2 }), s * 0.19, 2.1, 0.5));
    g.add(at(sph(0.02, '#ffffff'), s * 0.19 + 0.02, 2.13, 0.56));
    const ch = at(sph(0.085, '#F4A0A0'), s * 0.32, 1.96, 0.43); ch.scale.set(1, 0.6, 0.4); g.add(ch);
  }
  const smile = mesh(new THREE.TorusGeometry(0.11, 0.025, 12, 32, Math.PI), '#9C3B3B');
  smile.position.set(0, 1.95, 0.52); smile.rotation.z = Math.PI; g.add(smile);
  for (const [s, a] of [[-1, armL], [1, armR]]) {
    const pivot = new THREE.Group(); pivot.position.set(s * 0.46, 1.48, 0);
    pivot.add(at(cap(0.12, 0.42, shirt), 0, -0.3, 0));
    pivot.add(at(sph(0.14, skin), 0, -0.6, 0));
    pivot.rotation.z = s * a;
    g.add(pivot);
  }
  g.scale.setScalar(scale);
  return g;
}

function backpack(c = '#E8694A') {
  const g = group(rbox(0.95, 1.15, 0.5, 0.2, c));
  g.add(at(rbox(0.66, 0.46, 0.18, 0.08, '#F7C35B'), 0, -0.18, 0.3));
  const h = mesh(new THREE.TorusGeometry(0.17, 0.045, 12, 32, Math.PI), '#7A3524'); h.position.set(0, 0.57, 0); g.add(h);
  g.add(at(cyl(0.03, 0.03, 0.5, '#EFE6D8'), 0, 0.02, 0.4));
  rot(g.children[g.children.length - 1], 0, 0, Math.PI / 2);
  return g;
}

function book(c, w = 1.2, h = 0.22, d = 0.9) {
  return group(rbox(w, h, d, 0.04, c), at(rbox(w - 0.06, h * 0.7, d - 0.04, 0.02, '#FBF6EA'), 0.04, 0, 0));
}

function pencil(len = 2, c = '#F7C35B') {
  const g = new THREE.Group();
  g.add(cyl(0.12, 0.12, len, c, 6));
  g.add(at(cyl(0.12, 0.12, 0.14, '#C9CED6', 24, { metalness: 0.7, roughness: 0.3 }), 0, len / 2 + 0.07, 0));
  g.add(at(cyl(0.12, 0.12, 0.2, '#F28FA6', 24), 0, len / 2 + 0.24, 0));
  g.add(at(cyl(0.12, 0.03, 0.34, '#E9C9A0', 24), 0, -len / 2 - 0.17, 0));
  g.add(at(cyl(0.03, 0.0, 0.1, '#33313A', 24), 0, -len / 2 - 0.39, 0));
  return g;
}

function star(r = 0.5, c = '#F6C445', depth = 0.18) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 6 });
  geo.center();
  return mesh(geo, c, { metalness: 0.2, roughness: 0.35 });
}

function heart(sz = 1, c = '#EF5B6E') {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.15, -0.35, -0.6, -0.15, -0.6, 0.18);
  s.bezierCurveTo(-0.6, 0.45, -0.35, 0.6, -0.15, 0.55);
  s.bezierCurveTo(-0.05, 0.52, 0, 0.45, 0, 0.38);
  s.bezierCurveTo(0, 0.45, 0.05, 0.52, 0.15, 0.55);
  s.bezierCurveTo(0.35, 0.6, 0.6, 0.45, 0.6, 0.18);
  s.bezierCurveTo(0.6, -0.15, 0.15, -0.35, 0, -0.5);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 8, curveSegments: 32 });
  geo.center();
  const m = mesh(geo, c, { roughness: 0.3 }); m.scale.setScalar(sz); return m;
}

function check(c = '#3FB47A') {
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0.05); s.lineTo(-0.32, 0.23); s.lineTo(-0.12, 0.02); s.lineTo(0.38, 0.52); s.lineTo(0.56, 0.34); s.lineTo(-0.12, -0.34); s.lineTo(-0.5, 0.05);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 6 });
  geo.center(); return mesh(geo, c, { roughness: 0.35 });
}

function apple(r = 0.35) {
  const a = sph(r, '#E2463F', { roughness: 0.3 }); a.scale.set(1, 0.92, 1);
  const leaf = sph(0.12, '#5DB65B'); leaf.scale.set(1.4, 0.35, 0.7); leaf.position.set(0.12, r + 0.05, 0); leaf.rotation.z = 0.5;
  return group(a, at(cyl(0.025, 0.03, 0.18, '#6B4426'), 0, r, 0), leaf);
}

function prism(w, h, len, c) { // triangular roof along x
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 4 });
  geo.translate(0, 0, -len / 2);
  return mesh(geo, c);
}

function house(wall = '#FBE3C4', roof = '#D9604A', w = 2, h = 1.4, d = 1.6) {
  const g = group(at(rbox(w, h, d, 0.08, wall), 0, h / 2, 0));
  const r = prism(d + 0.3, 0.9, w + 0.2, roof); r.rotation.y = Math.PI / 2; r.position.y = h; g.add(r);
  g.add(at(rbox(0.45, 0.8, 0.1, 0.05, '#8A5A3B'), 0, 0.4, d / 2));
  for (const s of [-1, 1]) g.add(at(rbox(0.38, 0.38, 0.08, 0.05, '#8FD3F0', { roughness: 0.1 }), s * 0.62, h * 0.6, d / 2));
  g.add(at(rbox(0.25, 0.6, 0.25, 0.04, '#B5543F'), w * 0.25, h + 0.65, -0.2));
  return g;
}

function tree(x, z, s = 1) {
  const g = group(at(cyl(0.09, 0.12, 0.6, '#8A5A3B'), 0, 0.3, 0), at(sph(0.42, '#6CC07A'), 0, 0.85, 0), at(sph(0.3, '#7FD08A'), 0.2, 1.1, 0.05));
  g.position.set(x, 0, z); g.scale.setScalar(s); return g;
}

function clock(c = '#4C7BD9', time = [8, 0]) {
  const g = new THREE.Group();
  const body = cyl(0.75, 0.75, 0.42, c, 64); body.rotation.x = Math.PI / 2; g.add(body);
  const face = cyl(0.62, 0.62, 0.44, '#FBF6EA', 64); face.rotation.x = Math.PI / 2; g.add(face);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.add(at(sph(0.035, '#3A3A4A'), Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0.23)); }
  const hand = (l, wd, a) => { const p = new THREE.Group(); p.add(at(rbox(wd, l, 0.03, 0.01, '#2A2230'), 0, l / 2, 0)); p.position.z = 0.24; p.rotation.z = -a; return p; };
  g.add(hand(0.32, 0.06, (time[0] % 12 + time[1] / 60) / 12 * Math.PI * 2), hand(0.46, 0.04, time[1] / 60 * Math.PI * 2));
  g.add(at(sph(0.05, '#E8694A'), 0, 0, 0.26));
  for (const s of [-1, 1]) {
    const b = mesh(new THREE.SphereGeometry(0.26, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), '#F7C35B', { metalness: 0.5, roughness: 0.3 });
    b.position.set(s * 0.45, 0.7, 0); b.rotation.z = -s * 0.5; g.add(b);
    const leg = cyl(0.05, 0.05, 0.3, '#3A3A4A'); leg.position.set(s * 0.45, -0.75, 0); leg.rotation.z = s * 0.4; g.add(leg);
  }
  g.add(at(cyl(0.05, 0.05, 0.35, '#3A3A4A'), 0, 0.85, 0), at(sph(0.08, '#3A3A4A'), 0, 1.02, 0));
  return g;
}

function desk(top = '#F2D6A8', leg = '#7C8BA6') {
  const g = group(at(rbox(2.2, 0.14, 1.2, 0.05, top), 0, 1.1, 0));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(at(cyl(0.05, 0.05, 1.05, leg, 16), x * 0.98, 0.53, z * 0.5));
  return g;
}
function chair(seat = '#E8894A', leg = '#7C8BA6') {
  const g = group(at(rbox(0.9, 0.12, 0.85, 0.05, seat), 0, 0.65, 0), at(rbox(0.9, 0.7, 0.1, 0.05, seat), 0, 1.15, -0.4));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(at(cyl(0.04, 0.04, 0.62, leg, 16), x * 0.38, 0.31, z * 0.36));
  return g;
}

// ---------- scenes ----------
const S = {};
const cam = (x, y, z, tx = 0, ty = 1.2, tz = 0, fov = 30) => { camera.fov = fov; const K = 1.17; camera.position.set(tx + (x - tx) * K, ty + (y - ty) * K, tz + (z - tz) * K); camera.lookAt(tx, ty, tz); camera.updateProjectionMatrix(); };

S.cover = () => {
  add(platform('#CFE0F5'));
  const k = kid({ armR: 2.6, shirt: '#4C7BD9' }); at(k, -0.6, 0, 0.3); k.rotation.y = 0.25; add(k);
  const bp = backpack(); at(bp, -0.6, 1.25, -0.25); add(bp);
  const b1 = at(book('#3FB47A'), 1.5, 0.11, 0.3), b2 = at(book('#E8694A', 1.1), 1.5, 0.33, 0.3), b3 = at(book('#F7C35B', 1.0), 1.5, 0.55, 0.3);
  b2.rotation.y = 0.25; b3.rotation.y = -0.15; add(b1, b2, b3);
  const p = pencil(2.0); at(p, 1.6, 1.0, -0.6); p.rotation.set(0, 0, -0.5); add(p);
  const a = apple(); at(a, 1.45, 0.98, 0.35); add(a);
  const st = star(0.35); at(st, 0.7, 2.9, -0.3); st.rotation.y = -0.3; add(st);
  cam(0, 4.2, 12, 0.2, 1.3, 0);
};

S.why = () => {
  add(platform('#FBE3C4'));
  const bk = new THREE.Group();
  for (const s of [-1, 1]) { const pg = rbox(1.5, 0.14, 2.0, 0.05, '#FBF6EA'); pg.position.set(s * 0.76, 0.3, 0); pg.rotation.z = -s * 0.12; bk.add(pg); }
  for (const s of [-1, 1]) { const cv = rbox(1.6, 0.1, 2.1, 0.04, '#4C7BD9'); cv.position.set(s * 0.8, 0.16, 0); cv.rotation.z = -s * 0.12; bk.add(cv); }
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) bk.add(at(rbox(1.0, 0.03, 0.08, 0.01, '#B9C3D6'), s * 0.78, 0.42 + (s > 0 ? 0 : 0), -0.6 + i * 0.35));
  bk.rotation.x = 0.15; add(bk);
  const st = star(0.75); at(st, 0, 2.3, 0); st.rotation.y = 0.2; add(st);
  const ck = check(); ck.scale.setScalar(1.4); at(ck, -2.0, 1.4, 0.6); ck.rotation.y = 0.4; add(ck);
  const h = heart(0.7); at(h, 2.0, 1.3, 0.6); h.rotation.y = -0.4; add(h);
  cam(0, 5, 11, 0, 1.0, 0);
};

S.morning = () => {
  add(platform('#FFE2D1'));
  const c = clock('#4C7BD9', [7, 30]); at(c, -1.0, 1.15, 0); c.rotation.y = 0.3; add(c);
  const bp = backpack('#3FB47A'); at(bp, 1.2, 0.6, -0.2); bp.rotation.y = -0.35; add(bp);
  const a = apple(0.32); at(a, 0.2, 0.3, 1.3); add(a);
  // toothbrush + cup
  const cup = cyl(0.25, 0.22, 0.55, '#8FD3F0', 32, { roughness: 0.2 }); at(cup, 1.9, 0.28, 1.2); add(cup);
  const tb = group(at(cyl(0.05, 0.05, 1.0, '#F06C8C', 16), 0, 0, 0), at(rbox(0.12, 0.25, 0.1, 0.03, '#FBF6EA'), 0, 0.55, 0.05));
  at(tb, 1.95, 0.75, 1.2); tb.rotation.z = -0.25; add(tb);
  const b = at(book('#F7C35B', 1.0, 0.2, 0.75), -1.4, 0.1, 1.3); b.rotation.y = 0.4; add(b);
  cam(0, 4.5, 11.5, 0.1, 0.9, 0.2);
};

S.arrive = () => {
  add(platform('#D6ECD2'));
  const g = new THREE.Group();
  g.add(at(rbox(3.4, 1.9, 1.6, 0.1, '#FBE3C4'), 0, 0.95, -0.6));
  g.add(at(rbox(1.2, 2.6, 1.7, 0.1, '#F6D2A2'), 0, 1.3, -0.55));
  const roof = prism(1.95, 0.8, 1.4, '#D9604A'); roof.rotation.y = Math.PI / 2; roof.position.set(0, 2.6, -0.55); roof.rotation.order = 'YXZ'; g.add(roof);
  g.add(at(rbox(0.6, 0.95, 0.1, 0.06, '#8A5A3B'), 0, 0.48, 0.32));
  for (const x of [-1.25, -0.8, 0.8, 1.25]) for (const y of [0.6, 1.35]) g.add(at(rbox(0.32, 0.4, 0.08, 0.05, '#8FD3F0', { roughness: 0.1 }), x, y, 0.22));
  const cl = clock('#D9604A', [8, 0]); cl.scale.setScalar(0.32); at(cl, 0, 1.95, 0.3); g.add(cl);
  g.add(at(cyl(0.03, 0.03, 1.2, '#C9CED6', 12), 1.4, 2.5, -0.6));
  const fl = rbox(0.5, 0.32, 0.03, 0.02, '#E8694A'); at(fl, 1.67, 2.92, -0.6); g.add(fl);
  add(g);
  const k = kid({ shirt: '#4C7BD9', armL: 0.3, armR: 0.3, scale: 0.55 }); at(k, -0.6, 0, 1.6); k.rotation.y = 0.2; add(k);
  const bp = backpack('#E8694A'); bp.scale.setScalar(0.5); at(bp, -0.6, 0.72, 1.45); add(bp);
  const k2 = kid({ girl: true, shirt: '#F06C8C', hair: '#2F2420', scale: 0.55, armR: 2.5 }); at(k2, 0.7, 0, 1.6); k2.rotation.y = -0.2; add(k2);
  add(tree(-2.4, 0.4, 0.9), tree(2.4, 0.5, 0.8));
  cam(0, 4.0, 11.5, 0, 1.3, 0);
};

S.lesson = () => {
  add(platform('#E3DDF5'));
  const c = chair(); at(c, 0.3, 0, -1.1); c.rotation.y = -0.15; add(c);
  const k = kid({ armR: 2.9, shirt: '#E8894A' }); at(k, 0.3, 0, -0.55); k.rotation.y = -0.15; add(k);
  const d = desk(); at(d, 0.4, 0, 0.75); d.rotation.y = -0.15; add(d);
  const nb = at(book('#4C7BD9', 0.9, 0.1, 0.65), 0.1, 1.23, 0.9); nb.rotation.y = 0.1; add(nb);
  const p = pencil(0.8); p.rotation.set(Math.PI / 2, 0, 1.2); at(p, 0.9, 1.25, 0.95); add(p);
  const a = apple(0.25); at(a, -0.5, 1.42, 0.7); add(a);
  const bub = rbox(1.0, 1.0, 0.24, 0.35, '#FBF6EA'); at(bub, -1.6, 2.6, -0.2); add(bub);
  const q = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: textTex(['?'], { bg: '#FBF6EA', fg: '#4C7BD9', size: 380 }) }));
  q.position.set(-1.6, 2.6, -0.07); add(q);
  cam(0.5, 4.6, 11, 0, 1.4, 0);
};

S.board = () => {
  add(platform('#D2E7F2'));
  const b = new THREE.Group();
  b.add(rbox(3.6, 2.1, 0.18, 0.06, '#B98552'));
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.8), new THREE.MeshStandardMaterial({ map: textTex(['2 + 3 = 5', '★  ★  ★'], { w: 1024, h: 560, size: 150, bg: '#2E5E4E' }), roughness: 0.9 }));
  surf.position.z = 0.1; b.add(surf);
  for (const s of [-1, 1]) b.add(at(cyl(0.06, 0.06, 1.4, '#8A5A3B', 16), s * 1.5, -1.6, -0.1));
  b.add(at(rbox(3.4, 0.08, 0.25, 0.03, '#B98552'), 0, -1.08, 0.1));
  at(b, 0, 2.3, -1.2); add(b);
  const k1 = kid({ shirt: '#4C7BD9', scale: 0.62 }); at(k1, -1.2, 0, 1.1); k1.rotation.y = Math.PI + 0.3; add(k1);
  const k2 = kid({ girl: true, shirt: '#F06C8C', hair: '#2F2420', scale: 0.62 }); at(k2, 0.1, 0, 1.3); k2.rotation.y = Math.PI; add(k2);
  const k3 = kid({ shirt: '#3FB47A', hair: '#C88A3F', scale: 0.62, armL: 2.8 }); at(k3, 1.3, 0, 1.0); k3.rotation.y = Math.PI - 0.3; add(k3);
  cam(0, 4.6, 11.5, 0, 1.4, 0);
};

S.play = () => {
  add(platform('#D6ECD2'));
  // slide
  const g = new THREE.Group();
  for (const x of [-0.4, 0.4]) g.add(at(cyl(0.06, 0.06, 2.0, '#4C7BD9', 16), x, 1.0, -1.0));
  g.add(at(rbox(1.0, 0.1, 0.8, 0.04, '#F7C35B'), 0, 2.0, -0.8));
  for (let i = 0; i < 5; i++) g.add(at(cyl(0.04, 0.04, 0.8, '#C9CED6', 12), 0, 0.35 + i * 0.38, -1.0)), g.children[g.children.length - 1].rotation.z = Math.PI / 2;
  const plank = rbox(0.9, 0.12, 2.6, 0.06, '#E8694A'); plank.position.set(0, 1.0, 0.55); plank.rotation.x = 0.75; g.add(plank);
  for (const s of [-1, 1]) { const rail = rbox(0.08, 0.2, 2.6, 0.04, '#D9604A'); rail.position.set(s * 0.45, 1.12, 0.55); rail.rotation.x = 0.75; g.add(rail); }
  at(g, -1.2, 0, -0.3); g.rotation.y = 0.5; add(g);
  // ball
  const tex = (() => { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d'); const cs = ['#E8694A', '#FBF6EA', '#4C7BD9', '#FBF6EA', '#F7C35B', '#FBF6EA']; cs.forEach((c, i) => { x.fillStyle = c; x.fillRect(i * 512 / 6, 0, 512 / 6 + 1, 256); }); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const ball = mesh(new THREE.SphereGeometry(0.55, 48, 32), new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.35, clearcoat: 0.5 }));
  at(ball, 1.6, 0.55, 0.7); ball.rotation.set(0.3, 0.6, 0.2); add(ball);
  const k = kid({ shirt: '#3FB47A', scale: 0.7, armL: 0.9, armR: 0.9 }); at(k, 0.6, 0, 1.4); k.rotation.y = 0.5; add(k);
  add(tree(2.3, -1.2, 1.1));
  cam(0, 4.3, 11.5, 0.2, 1.1, 0);
};

S.hygiene = () => {
  add(platform('#D2E7F2'));
  // sink
  const sink = group(at(rbox(1.8, 0.9, 1.2, 0.12, '#FBF6EA'), 0, 0.45, 0), at(rbox(1.4, 0.2, 0.8, 0.08, '#B9DDF0'), 0, 0.85, 0.05));
  const tap = group(at(cyl(0.07, 0.07, 0.6, '#C9CED6', 16, { metalness: 0.8, roughness: 0.25 }), 0, 1.2, -0.45));
  const sp = cyl(0.06, 0.06, 0.4, '#C9CED6', 16, { metalness: 0.8, roughness: 0.25 }); sp.rotation.x = Math.PI / 2; sp.position.set(0, 1.48, -0.28); tap.add(sp);
  sink.add(tap);
  for (let i = 0; i < 3; i++) { const dr = sph(0.07, '#5FB8E8', { transmission: 0.3, roughness: 0.05 }); dr.scale.set(1, 1.4, 1); dr.position.set(0, 1.28 - i * 0.18, -0.1); sink.add(dr); }
  sink.scale.setScalar(1.35); at(sink, -0.8, 0, -0.4); add(sink);
  const soap = rbox(0.9, 0.4, 0.6, 0.18, '#F7A6C0'); at(soap, 1.0, 0.2, 1.1); soap.rotation.y = 0.4; add(soap);
  for (const [x, y, z, r] of [[0.8, 0.8, 1.0, 0.2], [1.25, 1.1, 0.9, 0.14], [0.6, 1.4, 0.8, 0.11], [1.5, 0.65, 1.3, 0.1], [0.2, 2.2, 0.2, 0.15], [-0.3, 2.6, 0.1, 0.1]]) add(at(sph(r, '#FFFFFF', { transmission: 0.6, roughness: 0.05, opacity: 0.7, transparent: true, iridescence: 1 }), x, y, z));
  const a = apple(0.4); at(a, 1.1, 0.4, -0.9); add(a);
  const bottle = group(cyl(0.22, 0.22, 0.9, '#5FB8E8', 32, { roughness: 0.15 }), at(cyl(0.14, 0.14, 0.18, '#3D6FB6', 32), 0, 0.53, 0));
  bottle.scale.setScalar(1.3); at(bottle, 2.0, 0.58, 0.1); add(bottle);
  cam(0, 4.6, 10.5, 0.2, 1.0, 0);
};

S.friends = () => {
  add(platform('#FFE2D1'));
  const k1 = kid({ shirt: '#4C7BD9', armR: 0.55, armL: 0.25 }); k1.scale.setScalar(0.9); at(k1, -0.75, 0, 0.2); k1.rotation.y = 0.25; add(k1);
  const k2 = kid({ girl: true, shirt: '#F7C35B', hair: '#2F2420', armL: 0.55, armR: 2.6 }); k2.scale.setScalar(0.9); at(k2, 0.75, 0, 0.2); k2.rotation.y = -0.25; add(k2);
  const h = heart(0.9); at(h, 0, 3.0, 0); add(h);
  const h2 = heart(0.4, '#F7A6C0'); at(h2, -1.6, 2.6, -0.3); h2.rotation.z = 0.3; add(h2);
  const h3 = heart(0.35, '#F7A6C0'); at(h3, 1.7, 2.3, -0.3); h3.rotation.z = -0.3; add(h3);
  cam(0, 3.8, 11.5, 0, 1.6, 0);
};

S.street = () => {
  add(platform('#D6ECD2'));
  add(at(rbox(6.0, 0.06, 2.0, 0.03, '#5C6577'), 0, 0.03, 0.6));
  for (let i = -2; i <= 2; i++) add(at(rbox(0.5, 0.08, 1.7, 0.03, '#F5F2E8'), i * 0.8, 0.05, 0.6));
  const tl = new THREE.Group();
  tl.add(at(cyl(0.08, 0.1, 2.4, '#3A3A4A', 16), 0, 1.2, 0));
  tl.add(at(rbox(0.7, 1.7, 0.5, 0.15, '#2A2E3A'), 0, 2.9, 0));
  const lamps = [['#E2463F', 0.35, 3.45], ['#F7C35B', 0.35, 2.9], ['#3FD07A', 2.2, 2.35]];
  for (const [c, ei, y] of lamps) tl.add(at(sph(0.2, c, { emissive: c, emissiveIntensity: ei === 2.2 ? 1.6 : 0.15, roughness: 0.2 }), 0, y, 0.24));
  at(tl, -2.2, 0, -0.9); add(tl);
  const k = kid({ shirt: '#E8894A', scale: 0.62, armR: 0.5 }); at(k, -0.2, 0, -0.9); add(k);
  const ad = kid({ shirt: '#3D6FB6', pants: '#2A2E3A', hair: '#2F2420', scale: 0.95, armL: 0.5 }); at(ad, 0.85, 0, -0.95); add(ad);
  add(tree(2.3, -1.5, 1));
  cam(0, 4.6, 11.5, 0, 1.2, 0);
};

S.stranger = () => {
  add(platform('#E3DDF5'));
  const hs = house(); at(hs, 1.2, 0, -1.0); hs.rotation.y = -0.4; add(hs);
  const ad = kid({ girl: true, shirt: '#3FB47A', hair: '#5A3A22', scale: 0.95, armR: 0.45 }); at(ad, -1.3, 0, 0.6); ad.rotation.y = 0.3; add(ad);
  const k = kid({ shirt: '#4C7BD9', scale: 0.62, armL: 0.5 }); at(k, -0.35, 0, 0.9); k.rotation.y = 0.2; add(k);
  // shield
  const s = new THREE.Shape(); s.moveTo(0, -0.6); s.bezierCurveTo(0.5, -0.35, 0.55, 0.1, 0.5, 0.5); s.lineTo(0, 0.62); s.lineTo(-0.5, 0.5); s.bezierCurveTo(-0.55, 0.1, -0.5, -0.35, 0, -0.6);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 6, curveSegments: 24 }); geo.center();
  const sh = mesh(geo, '#4C7BD9', { roughness: 0.3 }); at(sh, -0.8, 2.75, 0.2); add(sh);
  const ck = check('#FBF6EA'); ck.scale.setScalar(0.55); at(ck, -0.8, 2.75, 0.36); add(ck);
  add(tree(2.4, 0.9, 0.8));
  cam(0, 4.2, 11.5, 0, 1.3, 0);
};

S.homework = () => {
  add(platform('#FBE3C4'));
  const d = desk('#F2D6A8', '#B98552'); at(d, 0, 0, 0); add(d);
  const lamp = new THREE.Group();
  lamp.add(cyl(0.3, 0.35, 0.1, '#4C7BD9'));
  const a1 = cyl(0.04, 0.04, 0.9, '#4C7BD9', 12); a1.position.set(0.15, 0.45, 0); a1.rotation.z = -0.35; lamp.add(a1);
  const a2 = cyl(0.04, 0.04, 0.7, '#4C7BD9', 12); a2.position.set(0.05, 1.05, 0); a2.rotation.z = 1.1; lamp.add(a2);
  const shade = cyl(0.12, 0.36, 0.4, '#4C7BD9', 32); shade.position.set(-0.35, 1.0, 0); shade.rotation.z = 0.5; lamp.add(shade);
  lamp.add(at(sph(0.12, '#FFF3C4', { emissive: '#FFE38A', emissiveIntensity: 1.5 }), -0.42, 0.85, 0));
  at(lamp, 0.7, 1.2, -0.3); add(lamp);
  const nb = at(book('#3FB47A', 1.0, 0.1, 0.7), -0.3, 1.23, 0.15); nb.rotation.y = -0.2; add(nb);
  add(at(book('#E8694A', 0.9, 0.18, 0.65), -0.75, 1.27, -0.3), at(book('#F7C35B', 0.85, 0.16, 0.6), -0.75, 1.44, -0.3));
  const p = pencil(0.7); p.rotation.set(Math.PI / 2, 0, -0.9); at(p, 0.15, 1.27, 0.35); add(p);
  const bp = backpack('#4C7BD9'); bp.scale.setScalar(0.85); at(bp, 1.8, 0.5, 0.6); bp.rotation.y = -0.5; add(bp);
  const ck = check(); at(ck, -1.8, 1.0, 0.8); ck.rotation.y = 0.4; add(ck);
  cam(0, 4.8, 11, 0, 1.0, 0);
};

S.rest = () => {
  add(platform('#D2E0F2'));
  const bed = new THREE.Group();
  bed.add(at(rbox(2.0, 0.4, 3.0, 0.1, '#B98552'), 0, 0.3, 0));
  bed.add(at(rbox(2.0, 1.2, 0.2, 0.08, '#B98552'), 0, 0.7, -1.45));
  bed.add(at(rbox(1.85, 0.3, 2.8, 0.12, '#FBF6EA'), 0, 0.62, 0));
  bed.add(at(rbox(1.3, 0.26, 0.6, 0.13, '#FFFFFF'), 0, 0.88, -1.0));
  bed.add(at(rbox(1.95, 0.22, 1.9, 0.1, '#4C7BD9'), 0, 0.85, 0.45));
  at(bed, -0.6, 0, -0.1); bed.rotation.y = 0.35; add(bed);
  // moon crescent
  const s = new THREE.Shape(); s.absarc(0, 0, 0.6, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0.3, 0.2, 0.5, 0, Math.PI * 2, true); s.holes.push(hole);
  const m = new THREE.Shape(); m.absarc(0, 0, 0.6, Math.PI * 0.12, Math.PI * 1.62, false);
  const geo = new THREE.ExtrudeGeometry((() => { const c = new THREE.Shape(); for (let i = 0; i <= 40; i++) { const a = Math.PI * 0.35 + i / 40 * Math.PI * 1.3; const p = [Math.cos(a) * 0.6, Math.sin(a) * 0.6]; i ? c.lineTo(...p) : c.moveTo(...p); } for (let i = 40; i >= 0; i--) { const a = Math.PI * 0.35 + i / 40 * Math.PI * 1.3; c.lineTo(Math.cos(a) * 0.45 + 0.2, Math.sin(a) * 0.45); } return c; })(), { depth: 0.15, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 6 });
  geo.center();
  const moon = mesh(geo, '#F6C445', { emissive: '#F6C445', emissiveIntensity: 0.25 }); at(moon, -0.3, 3.0, -0.5); add(moon);
  for (const [x, y, r] of [[0.8, 3.3, 0.18], [-1.4, 3.4, 0.14], [0.4, 2.6, 0.12]]) add(at(star(r, '#F6C445', 0.08), x, y, -0.5));
  // tablet with clock
  const tab = group(rbox(0.95, 1.3, 0.08, 0.08, '#2A2E3A'));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 1.12), new THREE.MeshBasicMaterial({ map: textTex(['20:00', 'Zzz'], { w: 410, h: 560, bg: '#3D6FB6', fg: '#FBF6EA', size: 100 }) }));
  scr.position.z = 0.05; tab.add(scr);
  at(tab, 1.9, 0.75, 0.8); tab.rotation.set(-0.25, -0.5, 0); add(tab);
  add(at(cyl(0.32, 0.36, 0.08, '#2A2E3A'), 1.9, 0.04, 0.9));
  cam(0, 4.5, 11.5, 0.2, 1.3, 0);
};

S.trophy = () => {
  add(platform('#FFE7B8'));
  const gold = { metalness: 0.45, roughness: 0.3, clearcoat: 0.8 };
  const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector2(0.15 + Math.sin(t * Math.PI * 0.5) * 0.75 * (0.3 + 0.7 * t), t * 1.4)); }
  const cup = mesh(new THREE.LatheGeometry(pts, 64), '#E9B53A', gold); cup.material.side = THREE.DoubleSide; at(cup, 0, 1.25, 0); add(cup);
  add(at(cyl(0.12, 0.2, 0.5, '#E9B53A', 32, gold), 0, 1.0, 0));
  add(at(rbox(1.3, 0.35, 1.0, 0.06, '#4C7BD9'), 0, 0.18, 0), at(rbox(1.0, 0.45, 0.8, 0.06, '#3D6FB6'), 0, 0.55, 0));
  const st = star(0.45, '#F6C445'); at(st, 0, 3.15, 0); add(st);
  for (const [x, y, c] of [[-1.9, 1.6, '#E8694A'], [1.9, 2.2, '#3FB47A'], [-1.5, 2.9, '#4C7BD9'], [1.6, 0.6, '#F06C8C']]) { const s2 = star(0.25, c, 0.1); at(s2, x, y, 0.3); s2.rotation.z = x; add(s2); }
  cam(0, 3.8, 11.5, 0, 1.55, 0);
};

const name = new URLSearchParams(location.search).get('s');
S[name]();
renderer.render(scene, camera);
window.DONE = true;
