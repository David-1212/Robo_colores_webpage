(() => {
'use strict';

const PALETTE = [
  { nombre: 'Verde',    hex: 0x00c853, css: '#00c853', nota: 261.63 },
  { nombre: 'Naranja',  hex: 0xff6d00, css: '#ff6d00', nota: 293.66 },
  { nombre: 'Violeta',  hex: 0xaa00ff, css: '#aa00ff', nota: 329.63 },
  { nombre: 'Cian',     hex: 0x00e5ff, css: '#00e5ff', nota: 392.00 },
  { nombre: 'Magenta',  hex: 0xf50057, css: '#f50057', nota: 440.00 },
  { nombre: 'Lima',     hex: 0xaeea00, css: '#aeea00', nota: 523.25 },
  { nombre: 'Turquesa', hex: 0x1de9b6, css: '#1de9b6', nota: 587.33 }
];
const KEYS_P1 = ['1','2','3','4','5','6','7'];
const KEYS_P2 = ['A','S','D','F','G','H','J'];
const GRAY = 0xdde3ea;
const ROSTER = [
  { id: 'volt',  name: 'VOLT',  css: '#00e5ff' },
  { id: 'nova',  name: 'NOVA',  css: '#aeea00' },
  { id: 'turbo', name: 'TURBO', css: '#ff6d00' },
  { id: 'pixel', name: 'PIXEL', css: '#aa00ff' },
  { id: 'luna',  name: 'LUNA',  css: '#f50057' }
];
const STEP_MS = 980;

let actx = null;
function tone(freq, dur = 0.18, type = 'sine', vol = 0.18, delay = 0) {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t0 = actx.currentTime + delay;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch (e) {}
}
function sndWin() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, 0.22, 'triangle', 0.2, i * 0.09)); }
function sndTick() { tone(880, 0.09, 'square', 0.12); }
function sndGo() { tone(1318.5, 0.3, 'square', 0.16); }

const $ = s => document.querySelector(s);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0e1c);
scene.fog = new THREE.Fog(0x0b0e1c, 14, 36);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 4.4, 10.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#scene').appendChild(renderer.domElement);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

scene.add(new THREE.HemisphereLight(0x93a4ff, 0x141824, 0.85));
const dir = new THREE.DirectionalLight(0xffffff, 0.9);
dir.position.set(4, 9, 6);
dir.castShadow = true;
dir.shadow.mapSize.set(1024, 1024);
dir.shadow.camera.left = -9;
dir.shadow.camera.right = 9;
dir.shadow.camera.top = 9;
dir.shadow.camera.bottom = -9;
scene.add(dir);
const rim = new THREE.DirectionalLight(0x7c4dff, 0.4);
rim.position.set(-6, 5, -6);
scene.add(rim);
const pl1 = new THREE.PointLight(0x00e5ff, 0.9, 12); pl1.position.set(-3.4, 3.4, 2.4); scene.add(pl1);
const pl2 = new THREE.PointLight(0xf50057, 0.9, 12); pl2.position.set(3.4, 3.4, 2.4); scene.add(pl2);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 90),
  new THREE.MeshStandardMaterial({ color: 0x0d1126, roughness: 0.95, metalness: 0 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(70, 46, 0x39437f, 0x1d2347);
grid.position.y = 0.02;
grid.material.transparent = true;
grid.material.opacity = 0.55;
scene.add(grid);

const rings = [];
[-1, 1].forEach(side => {
  const plat = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.55, 0.3, 40),
    new THREE.MeshStandardMaterial({ color: 0x161c38, metalness: 0.45, roughness: 0.5 })
  );
  plat.position.set(side * 3.3, 0.15, 0);
  plat.receiveShadow = true;
  scene.add(plat);
  const wrap = new THREE.Group();
  wrap.position.set(side * 3.3, 0.34, 0);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.035, 10, 70),
    new THREE.MeshStandardMaterial({ color: side < 0 ? 0x00e5ff : 0xf50057, emissive: side < 0 ? 0x00e5ff : 0xf50057, emissiveIntensity: 1.6 })
  );
  ring.rotation.x = Math.PI / 2;
  wrap.add(ring);
  scene.add(wrap);
  rings.push(wrap);
});

const glows = [];
[-1, 1].forEach(side => {
  const d = new THREE.Mesh(
    new THREE.CircleGeometry(0.95, 40),
    new THREE.MeshBasicMaterial({ color: side < 0 ? 0x00e5ff : 0xff2d78, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  d.rotation.x = -Math.PI / 2;
  d.position.set(side * 3.3, 0.33, 0);
  scene.add(d);
  glows.push(d);
});

const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(320 * 3);
for (let i = 0; i < 320; i++) {
  starPos[i * 3] = (Math.random() - 0.5) * 44;
  starPos[i * 3 + 1] = 2 + Math.random() * 13;
  starPos[i * 3 + 2] = -18 + Math.random() * 22;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x8fa8ff, size: 0.08, transparent: true, opacity: 0.85 }));
scene.add(stars);

function shinyNew() {
  return new THREE.MeshPhysicalMaterial({ color: 0xe8edf5, metalness: 0.6, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 });
}
function darkMatNew() {
  return new THREE.MeshStandardMaterial({ color: 0x232c47, metalness: 0.55, roughness: 0.45 });
}

class Robot {
  constructor(side, typeId) {
    this.side = side;
    this.homeX = side * 3.3;
    this.homeY = 0.3;
    this.t0 = Math.random() * 10;
    this.hopT = 1;
    this.blinkT = 1 + Math.random() * 2;
    this.mode = 'idle';
    this.baseRotY = -side * 0.14;
    this.groups = [];
    this.flashes = [];
    const g = new THREE.Group();
    g.position.set(this.homeX, this.homeY, 0);
    this.group = g;
    BUILDERS[typeId](this);
    scene.add(g);
  }
  zone() {
    const m = new THREE.MeshPhysicalMaterial({ color: GRAY, metalness: 0.35, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 });
    this.groups.push(m);
    return m;
  }
  add(geo, mat, x, y, z, parent) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    (parent || this.group).add(m);
    return m;
  }
  mkEyes(parent, dx, y, z, r) {
    const white = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.2, clearcoat: 1 });
    this.pupilMat = new THREE.MeshStandardMaterial({ color: 0x06232c, emissive: 0x00e5ff, emissiveIntensity: 1.5 });
    const sg = new THREE.SphereGeometry(r, 20, 16);
    const pg = new THREE.SphereGeometry(r * 0.45, 14, 10);
    [-1, 1].forEach(s => {
      const eye = this.add(sg, white, s * dx, y, z, parent);
      const pup = new THREE.Mesh(pg, this.pupilMat);
      pup.position.z = r * 0.62;
      eye.add(pup);
      if (s < 0) this.eyeL = eye; else this.eyeR = eye;
    });
  }
  mkArm(sx, o) {
    const piv = new THREE.Group();
    piv.position.set(sx * o.shX, o.shY, 0);
    this.group.add(piv);
    this.add(new THREE.SphereGeometry(o.r * 1.9, 18, 14), o.mat, 0, 0, 0, piv);
    const len = o.len;
    if (o.shape === 'box') {
      this.add(new THREE.BoxGeometry(o.r * 2.2, len, o.r * 2.2), o.mat, 0, -len / 2 - 0.05, 0, piv);
      this.add(new THREE.BoxGeometry(o.r * 2.8, o.r * 2.8, o.r * 2.8), o.mat, 0, -len - o.r, 0, piv);
    } else if (o.shape === 'orb') {
      this.add(new THREE.SphereGeometry(o.handR, 18, 14), o.mat, 0, -len, 0, piv);
    } else {
      this.add(new THREE.CylinderGeometry(o.r, o.r, len, 14), o.mat, 0, -len / 2, 0, piv);
      this.add(new THREE.SphereGeometry(o.handR, 16, 12), o.mat, 0, -len - 0.02, 0, piv);
    }
    return piv;
  }
  paint(i, hex) {
    const m = this.groups[i];
    if (!m) return;
    m.color.setHex(hex);
    m.emissive.setHex(hex);
    this.flashes.push({ m, t: 0 });
    this.hopT = 0;
  }
  completeLook(sq) {
    this.groups.forEach((m, i) => {
      if (m.color.getHex() === GRAY) {
        const c = PALETTE[sq[(i + 1) % sq.length]].hex;
        m.color.setHex(c);
        m.emissive.setHex(c);
        this.flashes.push({ m, t: -i * 0.12 });
      }
    });
  }
  setEyes(hex) { this.pupilMat.emissive.setHex(hex); }
  sadMode() {
    this.mode = 'sad';
    this.groups.forEach(m => { m.emissive.setHex(0xff1744); m.emissiveIntensity = 0.7; });
    this.pupilMat.emissive.setHex(0xff1744);
  }
  resetAll() {
    this.mode = 'idle';
    this.hopT = 1;
    this.flashes.length = 0;
    this.groups.forEach(m => { m.color.setHex(GRAY); m.emissive.setHex(0x000000); m.emissiveIntensity = 1; });
    this.pupilMat.emissive.setHex(0x00e5ff);
    this.headG.rotation.x = 0;
    this.group.scale.set(1, 1, 1);
  }
  update(dt, t) {
    const g = this.group;
    let y = Math.sin(t * 2.1 + this.t0) * 0.06;
    let sx = 1, sy = 1, sz = 1;
    let ry = this.baseRotY + Math.sin(t * 0.7 + this.t0) * 0.05;
    let aL = -0.14 - Math.sin(t * 2.6 + this.t0) * 0.08;
    let aR = 0.14 + Math.sin(t * 2.6 + this.t0 + 1.2) * 0.08;
    let hx = Math.sin(t * 1.3 + this.t0) * 0.05;
    if (this.hopT < 1) {
      this.hopT = Math.min(1, this.hopT + dt / 0.5);
      const s = Math.sin(this.hopT * Math.PI);
      y += s * 0.55;
      sy = 1 + s * 0.12;
      sx = sz = 1 - s * 0.07;
      aL -= s * 0.9;
      aR += s * 0.9;
    }
    if (this.mode === 'dance') {
      y += Math.abs(Math.sin(t * 7)) * 0.38;
      ry = t * 5;
      aL = -1.1 - Math.sin(t * 9) * 0.5;
      aR = 1.1 + Math.cos(t * 9) * 0.5;
      hx = Math.sin(t * 9) * 0.15;
      g.position.x = this.homeX;
    } else if (this.mode === 'sad') {
      hx = 0.45;
      sy = 0.94;
      aL = 0.3;
      aR = -0.3;
      g.position.x = this.homeX + Math.sin(t * 40) * 0.015;
    } else {
      g.position.x = this.homeX;
    }
    g.position.y = this.homeY + y;
    g.scale.set(sx, sy, sz);
    g.rotation.y = ry;
    this.armL.rotation.z = aL;
    this.armR.rotation.z = aR;
    this.headG.rotation.x = hx;
    this.blinkT -= dt;
    if (this.blinkT <= 0) this.blinkT = 2.2 + Math.random() * 2.4;
    const b = this.blinkT < 0.13 ? 0.15 : 1;
    this.eyeL.scale.y = b;
    this.eyeR.scale.y = b;
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.t += dt * 1.8;
      if (f.t < 0) continue;
      const k = Math.min(f.t, 1);
      f.m.emissiveIntensity = 0.55 + 1.2 * Math.sin(k * Math.PI);
      if (k >= 1) { f.m.emissiveIntensity = 0.55; this.flashes.splice(i, 1); }
    }
  }
}

function bVolt(R) {
  const dm = darkMatNew();
  const cab = R.zone(), torso = R.zone(), brz = R.zone(), panza = R.zone(), patas = R.zone(), nuc = R.zone(), ant = R.zone();
  const footGeo = new THREE.SphereGeometry(0.32, 20, 16);
  [-0.3, 0.3].forEach(x => {
    const f = R.add(footGeo, patas, x, 0.17, 0.05);
    f.scale.set(1, 0.68, 1.4);
    R.add(new THREE.BoxGeometry(0.3, 0.14, 0.12), dm, x, 0.14, 0.42);
  });
  const legGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 14);
  R.add(legGeo, patas, -0.3, 0.5, 0);
  R.add(legGeo, patas, 0.3, 0.5, 0);
  R.add(new THREE.BoxGeometry(1.2, 1.28, 0.85), torso, 0, 1.08, 0);
  R.add(new THREE.BoxGeometry(1.24, 0.16, 0.89), dm, 0, 0.58, 0);
  R.add(new THREE.BoxGeometry(0.88, 0.64, 0.06), dm, 0, 1.12, 0.44);
  R.add(new THREE.BoxGeometry(0.68, 0.44, 0.09), panza, 0, 1.12, 0.47);
  R.add(new THREE.SphereGeometry(0.19, 20, 16), nuc, 0, 1.58, 0.46);
  const cr = R.add(new THREE.TorusGeometry(0.27, 0.03, 10, 30), dm, 0, 1.58, 0.46);
  hg0(R, 2.04);
  const hg = R.headG;
  R.add(new THREE.BoxGeometry(0.96, 0.74, 0.8), cab, 0, 0, 0, hg);
  R.add(new THREE.BoxGeometry(1.0, 0.16, 0.06), dm, 0, 0.14, 0.41, hg);
  const eg = new THREE.CylinderGeometry(0.1, 0.1, 0.14, 14);
  [-1, 1].forEach(s => {
    const e = R.add(eg, dm, s * 0.53, 0.02, 0, hg);
    e.rotation.z = Math.PI / 2;
  });
  R.mkEyes(hg, 0.22, 0.06, 0.4, 0.115);
  R.add(new THREE.BoxGeometry(0.3, 0.055, 0.06), dm, 0, -0.2, 0.41, hg);
  R.add(new THREE.CylinderGeometry(0.028, 0.028, 0.32, 8), dm, 0, 0.53, 0, hg);
  const co = R.add(new THREE.TorusGeometry(0.06, 0.02, 8, 18), dm, 0, 0.66, 0, hg);
  co.rotation.x = Math.PI / 2;
  R.add(new THREE.SphereGeometry(0.11, 16, 12), ant, 0, 0.76, 0, hg);
  R.armL = R.mkArm(-1, { shX: 0.71, shY: 1.5, len: 0.6, r: 0.08, handR: 0.13, mat: brz });
  R.armR = R.mkArm(1, { shX: 0.71, shY: 1.5, len: 0.6, r: 0.08, handR: 0.13, mat: brz });
}

function hg0(R, y) {
  const hg = new THREE.Group();
  hg.position.set(0, y, 0);
  R.group.add(hg);
  R.headG = hg;
  return hg;
}
const HG = hg0;

function bNova(R) {
  const dm = darkMatNew();
  const cab = R.zone(), torso = R.zone(), brz = R.zone(), panza = R.zone(), patas = R.zone(), nuc = R.zone(), ant = R.zone();
  const footGeo = new THREE.SphereGeometry(0.29, 20, 16);
  [-0.27, 0.27].forEach(x => {
    const f = R.add(footGeo, patas, x, 0.16, 0.04);
    f.scale.set(1, 0.66, 1.32);
  });
  const legGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.3, 12);
  R.add(legGeo, patas, -0.27, 0.42, 0);
  R.add(legGeo, patas, 0.27, 0.42, 0);
  const body = R.add(new THREE.SphereGeometry(0.8, 30, 24), torso, 0, 1.12, 0);
  body.scale.set(1, 0.92, 0.88);
  const eq = R.add(new THREE.TorusGeometry(0.805, 0.028, 10, 60), dm, 0, 1.12, 0);
  eq.rotation.x = Math.PI / 2;
  const pz = R.add(new THREE.CylinderGeometry(0.38, 0.38, 0.07, 30), panza, 0, 1.02, 0.74);
  pz.rotation.x = Math.PI / 2;
  const gem = R.add(new THREE.OctahedronGeometry(0.21, 0), nuc, 0, 1.44, 0.66);
  gem.rotation.y = Math.PI / 4;
  const hg = HG(R, 2.06);
  const head = R.add(new THREE.SphereGeometry(0.58, 28, 22), cab, 0, 0, 0, hg);
  head.scale.set(1, 0.88, 0.95);
  [-1, 1].forEach(s => R.add(new THREE.SphereGeometry(0.06, 12, 10), dm, s * 0.4, -0.08, 0.46, hg));
  R.mkEyes(hg, 0.23, 0.06, 0.47, 0.125);
  R.add(new THREE.BoxGeometry(0.24, 0.05, 0.05), dm, 0, -0.22, 0.5, hg);
  R.add(new THREE.CylinderGeometry(0.028, 0.028, 0.3, 8), dm, 0, 0.6, 0, hg);
  const ar = R.add(new THREE.TorusGeometry(0.08, 0.02, 8, 20), dm, 0, 0.72, 0, hg);
  ar.rotation.x = Math.PI / 2;
  R.add(new THREE.SphereGeometry(0.1, 16, 12), ant, 0, 0.84, 0, hg);
  R.armL = R.mkArm(-1, { shX: 0.79, shY: 1.32, len: 0.52, r: 0.085, handR: 0.14, mat: brz });
  R.armR = R.mkArm(1, { shX: 0.79, shY: 1.32, len: 0.52, r: 0.085, handR: 0.14, mat: brz });
}

function bTurbo(R) {
  const bm = shinyNew(), dm = darkMatNew();
  const cab = R.zone(), torso = R.zone(), brz = R.zone(), panza = R.zone(), patas = R.zone(), nuc = R.zone(), ant = R.zone();
  const wg = new THREE.CylinderGeometry(0.24, 0.24, 0.17, 22);
  [-0.27, 0.27].forEach(x => {
    const w = R.add(wg, patas, x, 0.21, 0.06);
    w.rotation.z = Math.PI / 2;
    const h = R.add(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 14), dm, x, 0.21, 0.06);
    h.rotation.z = Math.PI / 2;
  });
  R.add(new THREE.BoxGeometry(0.36, 0.1, 0.14), dm, 0, 0.21, 0.06);
  R.add(new THREE.BoxGeometry(0.84, 1.56, 0.64), torso, 0, 1.34, 0);
  R.add(new THREE.BoxGeometry(0.3, 1.24, 0.09), panza, 0, 1.34, 0.34);
  [-1, 1].forEach(s => {
    const ex = R.add(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 10), dm, s * 0.2, 1.95, -0.38);
    ex.rotation.x = Math.PI / 2;
  });
  R.add(new THREE.SphereGeometry(0.13, 18, 14), nuc, 0, 1.92, 0.2);
  const nk = R.add(new THREE.CylinderGeometry(0.11, 0.13, 0.36, 14), cab, 0, 2.24, 0);
  const hg = HG(R, 2.6);
  R.add(new THREE.BoxGeometry(0.74, 0.54, 0.62), cab, 0, 0, 0, hg);
  R.add(new THREE.BoxGeometry(0.78, 0.13, 0.05), dm, 0, 0.1, 0.32, hg);
  R.mkEyes(hg, 0.18, 0.04, 0.33, 0.095);
  R.add(new THREE.BoxGeometry(0.24, 0.05, 0.05), dm, 0, -0.15, 0.33, hg);
  const fin = R.add(new THREE.ConeGeometry(0.09, 0.3, 4), dm, 0, 0.4, -0.18, hg);
  fin.rotation.x = -0.4;
  R.add(new THREE.CylinderGeometry(0.024, 0.024, 0.28, 8), dm, 0, 0.4, 0.08, hg);
  R.add(new THREE.SphereGeometry(0.085, 14, 10), ant, 0, 0.59, 0.08, hg);
  R.armL = R.mkArm(-1, { shX: 0.56, shY: 1.98, len: 0.78, r: 0.06, handR: 0.1, mat: brz });
  R.armR = R.mkArm(1, { shX: 0.56, shY: 1.98, len: 0.78, r: 0.06, handR: 0.1, mat: brz });
}

function bPixel(R) {
  const dm = darkMatNew();
  const cab = R.zone(), torso = R.zone(), brz = R.zone(), panza = R.zone(), patas = R.zone(), nuc = R.zone(), ant = R.zone();
  const fg = new THREE.BoxGeometry(0.36, 0.24, 0.52);
  [-0.33, 0.33].forEach(x => {
    R.add(fg, patas, x, 0.12, 0.02);
    R.add(new THREE.BoxGeometry(0.38, 0.1, 0.14), dm, x, 0.08, 0.28);
  });
  R.add(new THREE.BoxGeometry(1.34, 1.34, 0.92), torso, 0, 1.12, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    R.add(new THREE.SphereGeometry(0.055, 10, 8), dm, sx * 0.62, 1.12 + sy * 0.62, 0.47);
  });
  R.add(new THREE.BoxGeometry(1.0, 1.0, 0.08), dm, 0, 1.12, 0.47);
  R.add(new THREE.BoxGeometry(0.74, 0.74, 0.1), panza, 0, 1.12, 0.49);
  const px = R.add(new THREE.OctahedronGeometry(0.17, 0), nuc, 0, 1.74, 0.48);
  px.rotation.y = Math.PI / 4;
  R.add(new THREE.BoxGeometry(0.32, 0.26, 0.46), cab, 0, 1.87, 0);
  const hg = HG(R, 2.2);
  R.add(new THREE.BoxGeometry(1.1, 0.56, 0.78), cab, 0, 0, 0, hg);
  R.add(new THREE.BoxGeometry(1.14, 0.14, 0.06), dm, 0, 0.17, 0.4, hg);
  const eb = new THREE.BoxGeometry(0.12, 0.2, 0.2);
  [-1, 1].forEach(s => R.add(eb, dm, s * 0.61, 0.02, 0, hg));
  R.mkEyes(hg, 0.25, 0.03, 0.4, 0.1);
  R.add(new THREE.BoxGeometry(0.42, 0.06, 0.05), dm, 0, -0.16, 0.4, hg);
  R.add(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), dm, 0, 0.38, 0, hg);
  R.add(new THREE.SphereGeometry(0.09, 14, 10), ant, 0, 0.53, 0, hg);
  R.armL = R.mkArm(-1, { shX: 0.8, shY: 1.58, len: 0.56, r: 0.095, shape: 'box', mat: brz });
  R.armR = R.mkArm(1, { shX: 0.8, shY: 1.58, len: 0.56, r: 0.095, shape: 'box', mat: brz });
}

function bLuna(R) {
  const dm = darkMatNew();
  const cab = R.zone(), torso = R.zone(), brz = R.zone(), panza = R.zone(), patas = R.zone(), nuc = R.zone(), ant = R.zone();
  const thr = R.add(new THREE.TorusGeometry(0.45, 0.08, 14, 34), patas, 0, 0.42, 0);
  thr.rotation.x = Math.PI / 2;
  const flame = new THREE.Mesh(
    new THREE.CircleGeometry(0.34, 24),
    new THREE.MeshBasicMaterial({ color: 0x66e7ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  flame.rotation.x = -Math.PI / 2;
  flame.position.y = 0.3;
  R.group.add(flame);
  R.add(new THREE.CylinderGeometry(0.6, 0.64, 1.04, 28), torso, 0, 1.28, 0);
  const capT = R.add(new THREE.SphereGeometry(0.6, 28, 20), torso, 0, 1.8, 0);
  capT.scale.set(1, 0.5, 1);
  const capB = R.add(new THREE.SphereGeometry(0.64, 28, 20), torso, 0, 0.8, 0);
  capB.scale.set(1, 0.42, 1);
  const belt = R.add(new THREE.TorusGeometry(0.65, 0.055, 12, 44), panza, 0, 1.18, 0);
  belt.rotation.x = Math.PI / 2;
  const gem = R.add(new THREE.OctahedronGeometry(0.18, 0), nuc, 0, 1.54, 0.58);
  gem.rotation.y = Math.PI / 4;
  const hg = HG(R, 2.3);
  const head = R.add(new THREE.SphereGeometry(0.52, 28, 22), cab, 0, 0, 0, hg);
  head.scale.set(1, 0.82, 1);
  const halo = R.add(new THREE.TorusGeometry(0.36, 0.022, 10, 40), dm, 0, 0.62, 0, hg);
  halo.rotation.x = Math.PI / 2;
  R.mkEyes(hg, 0.2, 0.03, 0.43, 0.115);
  R.add(new THREE.BoxGeometry(0.22, 0.05, 0.05), dm, 0, -0.18, 0.47, hg);
  R.add(new THREE.CylinderGeometry(0.024, 0.024, 0.26, 8), dm, 0, 0.5, 0, hg);
  R.add(new THREE.SphereGeometry(0.1, 16, 12), ant, 0, 0.68, 0, hg);
  R.add(new THREE.SphereGeometry(0.12, 14, 10), dm, 0.88, 2.62, 0);
  R.armL = R.mkArm(-1, { shX: 0.84, shY: 1.52, len: 0.3, r: 0.07, shape: 'orb', handR: 0.16, mat: brz });
  R.armR = R.mkArm(1, { shX: 0.84, shY: 1.52, len: 0.3, r: 0.07, shape: 'orb', handR: 0.16, mat: brz });
}

const BUILDERS = { volt: bVolt, nova: bNova, turbo: bTurbo, pixel: bPixel, luna: bLuna };

let robots = null;
function destroyRobot(rt) {
  scene.remove(rt.group);
  rt.group.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material && o.material.dispose) o.material.dispose();
  });
}
function buildRobots(ro) {
  if (robots) { destroyRobot(robots[1]); destroyRobot(robots[2]); }
  robots = { 1: new Robot(-1, ro.id), 2: new Robot(1, ro.id) };
  curRobo = ro;
}

const confetti = [];
const sparks = [];
const confGeo = new THREE.BoxGeometry(0.14, 0.02, 0.14);
const sparkGeo = new THREE.TetrahedronGeometry(0.07, 0);
function burst(cx) {
  for (let i = 0; i < 90; i++) {
    const m = new THREE.Mesh(confGeo, new THREE.MeshBasicMaterial({ color: PALETTE[i % PALETTE.length].hex }));
    m.position.set(cx + (Math.random() - 0.5) * 1.6, 3.4 + Math.random() * 1.6, (Math.random() - 0.5) * 1.6);
    scene.add(m);
    confetti.push({
      m,
      v: new THREE.Vector3((Math.random() - 0.5) * 4.5, Math.random() * 4 + 2, (Math.random() - 0.5) * 4.5),
      av: new THREE.Vector3(Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4)
    });
  }
}
function sparkle(cx, cy, hex) {
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: hex }));
    m.position.set(cx + (Math.random() - 0.5) * 1.2, cy, (Math.random() - 0.5) * 1.0);
    scene.add(m);
    sparks.push({
      m,
      v: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 3 + 1.5, (Math.random() - 0.5) * 3),
      av: Math.random() * 6,
      t: 0
    });
  }
}

const els = {
  banner: $('#banner'),
  stage: $('#stage'),
  swatch: $('#swatch'),
  swName: $('#swatch-name'),
  swKeys: $('#swatch-keys'),
  count: $('#count'),
  roundinfo: $('#roundinfo'),
  pips: { 1: $('#pips1'), 2: $('#pips2') },
  ctr: { 1: $('#controls1'), 2: $('#controls2') },
  ctag: {},
  menu: $('#overlay-menu'),
  result: $('#overlay-result'),
  winTitle: $('#win-title'),
  winReason: $('#win-reason'),
  winScore: $('#win-score'),
  score: { 1: $('#score1'), 2: $('#score2') },
  btnNext: $('#btn-next')
};

let state = 'menu';
let curRobo = null;
let pairs = [];
let pairIdx = 0;
let seq = [];
let prog = { 1: 0, 2: 0 };
let seqLen = 5;
let timers = [];
let overAction = null;
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
function clearTimers() { timers.forEach(clearTimeout); timers = []; }

function genSeq(n) {
  const s = [];
  let prev = -1;
  while (s.length < n) {
    const r = (Math.random() * PALETTE.length) | 0;
    if (r !== prev) { s.push(r); prev = r; }
  }
  return s;
}

function buildControls() {
  [1, 2].forEach(p => {
    const box = els.ctr[p];
    const tag = document.createElement('div');
    tag.className = 'ctag' + (p === 2 ? ' p2' : '');
    box.appendChild(tag);
    els.ctag[p] = tag;
    const row = document.createElement('div');
    row.className = 'crow';
    box.appendChild(row);
    PALETTE.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'color-btn';
      b.dataset.p = p;
      b.dataset.i = i;
      b.style.setProperty('--c', c.css);
      b.innerHTML = `<span class="chip"></span><span class="lab">${p === 1 ? KEYS_P1[i] : KEYS_P2[i]}</span>`;
      b.addEventListener('click', () => press(p, i));
      row.appendChild(b);
    });
  });
}

function startSeqGame() {
  pairs = ROSTER.map(() => ({ w1: 0, w2: 0 }));
  pairIdx = 0;
  startPair();
}

function setControls(on) {
  [1, 2].forEach(p => {
    els.ctr[p].classList.toggle('off', !on);
    els.pips[p].classList.toggle('off', !on);
  });
}

function flashBtn(p, i, cls, ms) {
  const b = document.querySelector(`.color-btn[data-p="${p}"][data-i="${i}"]`);
  if (!b) return;
  b.classList.remove('pressed', 'wrong', 'hint');
  void b.offsetWidth;
  b.classList.add(cls);
  setTimeout(() => b.classList.remove(cls), ms || 170);
}

function setBanner(txt) {
  els.banner.textContent = txt;
  els.banner.classList.remove('hidden');
}
function hideBanner() { els.banner.classList.add('hidden'); }

function applyMatchUI() {
  const pr = pairs[pairIdx];
  els.roundinfo.textContent = `ROBOT ${pairIdx + 1}/5 · ${curRobo.name}`;
  els.ctag[1].textContent = `${curRobo.name} · JUGADOR 1 · TECLAS 1-7`;
  els.ctag[2].textContent = `${curRobo.name} · JUGADOR 2 · TECLAS A S D F G H J`;
  els.score[1].textContent = pr.w1;
  els.score[2].textContent = pr.w2;
  els.roundinfo.classList.remove('hidden');
}

function buildPips() {
  [1, 2].forEach(p => {
    els.pips[p].innerHTML = '';
    for (let i = 0; i < seq.length; i++) {
      const s = document.createElement('span');
      if (i === 0) s.className = 'current';
      els.pips[p].appendChild(s);
    }
  });
}
function fillPip(p, idx, css) {
  const s = els.pips[p].children[idx];
  if (!s) return;
  s.style.background = css;
  s.style.boxShadow = `0 0 12px ${css}`;
  s.classList.remove('current');
  const nx = els.pips[p].children[idx + 1];
  if (nx) nx.classList.add('current');
}

function showSwatch(i) {
  const c = PALETTE[i];
  els.stage.querySelectorAll('.mini').forEach(m => m.remove());
  els.stage.classList.remove('hidden', 'row');
  els.swatch.style.background = c.css;
  els.swatch.style.boxShadow = `0 0 70px ${c.css}, inset 0 0 30px rgba(255,255,255,.35)`;
  els.swName.textContent = c.nombre;
  els.swKeys.textContent = `Jugador 1 → ${KEYS_P1[i]}   ·   Jugador 2 → ${KEYS_P2[i]}`;
  els.swatch.classList.remove('pop');
  void els.swatch.offsetWidth;
  els.swatch.classList.add('pop');
}

function safeShowStep(ci) {
  try {
    if (state !== 'show') return;
    showSwatch(ci);
    [1, 2].forEach(p => {
      if (robots[p]) robots[p].setEyes(PALETTE[ci].hex);
      flashBtn(p, ci, 'hint', 620);
    });
    tone(PALETTE[ci].nota, 0.24, 'sine', 0.22);
  } catch (e) {
    console.error('Error en paso de secuencia:', e);
  }
}

function playShow(initialDelay) {
  clearTimers();
  state = 'show';
  seq.forEach((ci, i) => later(() => safeShowStep(ci), initialDelay + i * STEP_MS));
  later(() => {
    try { recap(); } catch (e) { console.error('Error en repaso:', e); recap(); }
  }, initialDelay + seq.length * STEP_MS);
}

function recap() {
  setBanner('¿La tienes en mente?');
  els.stage.classList.add('row');
  els.stage.querySelectorAll('.mini').forEach(m => m.remove());
  seq.forEach(ci => {
    const c = PALETTE[ci];
    const s = document.createElement('span');
    s.className = 'mini';
    s.style.background = c.css;
    s.style.boxShadow = `0 0 16px ${c.css}`;
    els.stage.appendChild(s);
  });
  later(countdown, 1900);
}

function countdown() {
  els.stage.classList.add('hidden');
  const steps = ['3', '2', '1', '¡YA!'];
  steps.forEach((s, i) => later(() => {
    try {
      els.count.textContent = s;
      els.count.classList.remove('hidden');
      els.count.classList.remove('zoom');
      void els.count.offsetWidth;
      els.count.classList.add('zoom');
      if (s === '¡YA!') sndGo(); else sndTick();
    } catch (e) { console.error('Error en cuenta regresiva:', e); }
  }, i * 650));
  later(() => {
    els.count.classList.add('hidden');
    try { beginInput(); } catch (e) { console.error('Error al iniciar turno:', e); }
  }, steps.length * 650);
}

function beginInput() {
  if (!robots || !robots[1] || !robots[2]) return;
  state = 'input';
  setBanner('¡Repite la secuencia! El más rápido gana');
  [1, 2].forEach(p => robots[p].setEyes(0x00e5ff));
  buildPips();
  setControls(true);
}

function press(p, idx) {
  if (state !== 'input') return;
  if (prog[p] >= seq.length) return;
  if (idx === seq[prog[p]]) {
    const c = PALETTE[idx];
    tone(c.nota, 0.16, 'triangle', 0.2);
    flashBtn(p, idx, 'pressed', 170);
    robots[p].paint(idx, c.hex);
    sparkle(robots[p].homeX, 2.1, c.hex);
    fillPip(p, prog[p], c.css);
    prog[p]++;
    if (prog[p] === seq.length) finish(p, 'seq', 0);
  } else {
    tone(120, 0.3, 'sawtooth', 0.24);
    flashBtn(p, idx, 'wrong', 400);
    finish(p === 1 ? 2 : 1, 'err', p);
  }
}

function prepRound() {
  clearTimers();
  seq = genSeq(seqLen);
  prog = { 1: 0, 2: 0 };
  els.menu.classList.add('hidden');
  els.result.classList.add('hidden');
  els.stage.classList.add('hidden');
  els.count.classList.add('hidden');
  els.pips[1].innerHTML = '';
  els.pips[2].innerHTML = '';
  setControls(false);
  overAction = null;
}

function startPair() {
  prepRound();
  buildRobots(ROSTER[pairIdx % ROSTER.length]);
  robots[1].resetAll();
  robots[2].resetAll();
  applyMatchUI();
  setBanner(`ROBOT ${pairIdx + 1} de 5: ¡a jugar!`);
  playShow(1100);
}

function finish(winner, how, errBy) {
  state = 'over';
  setControls(false);
  hideBanner();
  const pr = pairs[pairIdx];
  if (how === 'seq') pr['w' + winner]++;
  els.score[1].textContent = pr.w1;
  els.score[2].textContent = pr.w2;
  const loser = winner === 1 ? 2 : 1;
  robots[winner].completeLook(seq);
  robots[winner].mode = 'dance';
  robots[loser].sadMode();
  sndWin();
  burst(robots[winner].homeX);
  later(() => burst(robots[winner].homeX), 380);
  later(() => showResult(winner, how, errBy), 1300);
}

function showResult(winner, how, errBy) {
  els.winTitle.textContent = `¡Jugador ${winner} gana!`;
  els.winTitle.className = winner === 1 ? 'w1' : 'w2';
  els.winReason.textContent = how === 'seq'
    ? `El Jugador ${winner} repitió la secuencia completa antes que el Jugador ${winner === 1 ? 2 : 1}.`
    : `El Jugador ${errBy} presionó un color equivocado.`;
  const pr = pairs[pairIdx];
  els.winScore.textContent = `${pr.w1} — ${pr.w2}`;
  els.btnNext.classList.remove('hidden');
  overAction = 'next';
  els.result.classList.remove('hidden');
}

function goMenu() {
  clearTimers();
  state = 'menu';
  els.result.classList.add('hidden');
  els.menu.classList.remove('hidden');
  els.stage.classList.add('hidden');
  els.count.classList.add('hidden');
  els.roundinfo.classList.add('hidden');
  hideBanner();
  setControls(false);
  buildRobots(ROSTER[0]);
  robots[1].resetAll();
  robots[2].resetAll();
}

buildControls();
buildRobots(ROSTER[0]);

document.querySelectorAll('#diff button').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('#diff button').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
    seqLen = +b.dataset.len;
    tone(660, 0.07, 'square', 0.1);
  });
});
$('#btn-play').addEventListener('click', () => {
  tone(660, 0.1, 'square', 0.12);
  startSeqGame();
});
els.btnNext.addEventListener('click', () => {
  pairIdx = (pairIdx + 1) % ROSTER.length;
  startPair();
});
$('#btn-menu').addEventListener('click', () => goMenu());

addEventListener('keydown', e => {
  if (e.repeat) return;
  if (e.key === 'Enter') {
    if (state === 'menu') { $('#btn-play').click(); return; }
    if (state === 'over' && !els.result.classList.contains('hidden')) {
      if (overAction === 'next') els.btnNext.click();
      else $('#btn-menu').click();
      overAction = null;
      return;
    }
  }
  if (state !== 'input') return;
  const k = e.key.toUpperCase();
  const i1 = KEYS_P1.indexOf(e.key);
  const i2 = KEYS_P2.indexOf(k);
  if (i1 >= 0) press(1, i1);
  else if (i2 >= 0) press(2, i2);
});

const clock = new THREE.Clock();
(function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  robots[1].update(dt, t);
  robots[2].update(dt, t);
  stars.rotation.y = t * 0.01;
  rings[0].rotation.y = t * 0.5;
  rings[1].rotation.y = -t * 0.5;
  glows.forEach((d, i) => {
    const s = 1 + Math.sin(t * 2 + i * 2) * 0.06;
    d.scale.set(s, s, 1);
    d.material.opacity = 0.16 + 0.08 * (Math.sin(t * 2 + i * 2) + 1) / 2;
  });
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.t += dt;
    s.v.y -= dt * 9;
    s.m.position.addScaledVector(s.v, dt);
    s.m.rotation.x += s.av * dt;
    s.m.rotation.y += s.av * dt;
    if (s.t > 0.9 || s.m.position.y < 0.05) {
      scene.remove(s.m);
      s.m.material.dispose();
      sparks.splice(i, 1);
    }
  }
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.v.y -= dt * 7.5;
    c.m.position.addScaledVector(c.v, dt);
    c.m.rotation.x += c.av.x * dt;
    c.m.rotation.y += c.av.y * dt;
    c.m.rotation.z += c.av.z * dt;
    if (c.m.position.y < 0.05) {
      scene.remove(c.m);
      c.m.material.dispose();
      confetti.splice(i, 1);
    }
  }
  camera.position.x = Math.sin(t * 0.28) * 0.4;
  camera.lookAt(0, 1.7, 0);
  renderer.render(scene, camera);
})();

})();
