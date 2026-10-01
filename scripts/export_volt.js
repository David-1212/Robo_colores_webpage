const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { OBJExporter } = require('three/examples/jsm/exporters/OBJExporter.js');

function createVoltRobot(colored = true) {
    const root = new THREE.Group();
    root.name = 'Robot_Volt';

    // Materials definition
    const matDefs = {
        torso: colored ? { color: 0x00e5ff, name: 'mat_torso_cyan' } : { color: 0x242a3e, name: 'mat_base_metal' },
        cab:   colored ? { color: 0x00c853, name: 'mat_head_green' } : { color: 0x242a3e, name: 'mat_base_metal' },
        brz:   colored ? { color: 0xaa00ff, name: 'mat_arms_purple' } : { color: 0x242a3e, name: 'mat_base_metal' },
        panza: colored ? { color: 0xffd600, name: 'mat_belly_yellow' } : { color: 0x242a3e, name: 'mat_base_metal' },
        patas: colored ? { color: 0xff6d00, name: 'mat_legs_orange' } : { color: 0x242a3e, name: 'mat_base_metal' },
        nuc:   colored ? { color: 0xff1744, name: 'mat_core_red' } : { color: 0x242a3e, name: 'mat_base_metal' },
        ant:   colored ? { color: 0xf50057, name: 'mat_antenna_magenta' } : { color: 0x242a3e, name: 'mat_base_metal' },
    };

    const materials = {};
    for (const [key, val] of Object.entries(matDefs)) {
        materials[key] = new THREE.MeshStandardMaterial({
            color: val.color,
            name: val.name,
            roughness: 0.35,
            metalness: 0.5
        });
    }

    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x161924,
        name: 'mat_dark_trim',
        roughness: 0.45,
        metalness: 0.65
    });

    const eyeMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        name: 'mat_eyes_cyan'
    });

    function addMesh(geo, mat, x, y, z, parent = null, name = '') {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        if (name) m.name = name;
        if (parent) {
            parent.add(m);
        } else {
            root.add(m);
        }
        return m;
    }

    // --- LEGS ---
    const legLGroup = new THREE.Group();
    legLGroup.name = 'Leg_L_Group';
    legLGroup.position.set(-0.35, 0.6, 0);
    root.add(legLGroup);

    const legRGroup = new THREE.Group();
    legRGroup.name = 'Leg_R_Group';
    legRGroup.position.set(0.35, 0.6, 0);
    root.add(legRGroup);

    const footGeo = new THREE.SphereGeometry(0.3, 16, 12);
    const leftFoot = addMesh(footGeo, materials['patas'], 0, -0.4, 0.05, legLGroup, 'Foot_L');
    leftFoot.scale.set(1, 0.5, 1.4);

    const rightFoot = addMesh(footGeo, materials['patas'], 0, -0.4, 0.05, legRGroup, 'Foot_R');
    rightFoot.scale.set(1, 0.5, 1.4);

    const toeGeo = new THREE.BoxGeometry(0.26, 0.1, 0.12);
    addMesh(toeGeo, darkMat, 0, -0.4, 0.32, legLGroup, 'Toe_L');
    addMesh(toeGeo, darkMat, 0, -0.4, 0.32, legRGroup, 'Toe_R');

    const legGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.35, 12);
    addMesh(legGeo, materials['patas'], 0, -0.2, 0, legLGroup, 'Leg_Column_L');
    addMesh(legGeo, materials['patas'], 0, -0.2, 0, legRGroup, 'Leg_Column_R');

    // --- TORSO ---
    const torsoGeo = new THREE.BoxGeometry(1.0, 1.15, 0.75);
    addMesh(torsoGeo, materials['torso'], 0, 1.1, 0, null, 'Torso');

    const waistGeo = new THREE.BoxGeometry(1.05, 0.14, 0.78);
    addMesh(waistGeo, darkMat, 0, 0.525, 0, null, 'Waist_Belt');

    const exhaustGeo = new THREE.BoxGeometry(0.75, 0.55, 0.06);
    addMesh(exhaustGeo, darkMat, 0, 1.1, 0.385, null, 'Chest_Plate_Backing');

    // --- BELLY PANEL ---
    const panzaGeo = new THREE.BoxGeometry(0.62, 0.42, 0.08);
    addMesh(panzaGeo, materials['panza'], 0, 1.1, 0.41, null, 'Power_Panel_Belly');

    // --- NECK & NUCLEUS ---
    const nucGeo = new THREE.SphereGeometry(0.18, 16, 12);
    addMesh(nucGeo, materials['nuc'], 0, 1.74, 0.0, null, 'Power_Core_Nucleus');

    const neckRing = addMesh(new THREE.TorusGeometry(0.24, 0.025, 8, 24), darkMat, 0, 1.74, 0, null, 'Neck_Collar_Ring');
    neckRing.rotation.x = Math.PI / 2;

    // --- HEAD ---
    const headGroup = new THREE.Group();
    headGroup.name = 'Head_Group';
    headGroup.position.set(0, 1.9, 0);
    root.add(headGroup);

    const headGeo = new THREE.BoxGeometry(0.85, 0.65, 0.7);
    addMesh(headGeo, materials['cab'], 0, 0.28, 0, headGroup, 'Head_Main');

    const visorGeo = new THREE.BoxGeometry(0.88, 0.15, 0.06);
    addMesh(visorGeo, darkMat, 0, 0.38, 0.33, headGroup, 'Visor_Frame');

    const eyeGeo = new THREE.SphereGeometry(0.09, 12, 10);
    addMesh(eyeGeo, eyeMat, -0.18, 0.38, 0.34, headGroup, 'Eye_L');
    addMesh(eyeGeo, eyeMat, 0.18, 0.38, 0.34, headGroup, 'Eye_R');

    const earGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12);
    const earL = addMesh(earGeo, darkMat, -0.45, 0.3, 0, headGroup, 'Ear_Audio_L');
    earL.rotation.z = Math.PI / 2;
    const earR = addMesh(earGeo, darkMat, 0.45, 0.3, 0, headGroup, 'Ear_Audio_R');
    earR.rotation.z = Math.PI / 2;

    const mouthGeo = new THREE.BoxGeometry(0.24, 0.05, 0.04);
    addMesh(mouthGeo, darkMat, 0, 0.14, 0.34, headGroup, 'Mouth_Vent');

    // --- ANTENNA ---
    const antBaseGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.28, 8);
    addMesh(antBaseGeo, darkMat, 0, 0.72, 0, headGroup, 'Antenna_Stem');

    const antGlobeGeo = new THREE.SphereGeometry(0.09, 12, 12);
    addMesh(antGlobeGeo, materials['ant'], 0, 0.88, 0, headGroup, 'Antenna_Beacon');

    // --- ARMS ---
    const armLGroup = new THREE.Group();
    armLGroup.name = 'Arm_L_Group';
    armLGroup.position.set(-0.62, 1.45, 0);
    root.add(armLGroup);

    const armRGroup = new THREE.Group();
    armRGroup.name = 'Arm_R_Group';
    armRGroup.position.set(0.62, 1.45, 0);
    root.add(armRGroup);

    const shoulderGeo = new THREE.SphereGeometry(0.14, 16, 12);
    addMesh(shoulderGeo, materials['brz'], 0, 0, 0, armLGroup, 'Shoulder_L');
    addMesh(shoulderGeo, materials['brz'], 0, 0, 0, armRGroup, 'Shoulder_R');

    const limbGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.5, 12);
    addMesh(limbGeo, materials['brz'], 0, -0.28, 0, armLGroup, 'Arm_Limb_L');
    addMesh(limbGeo, materials['brz'], 0, -0.28, 0, armRGroup, 'Arm_Limb_R');

    const fistGeo = new THREE.SphereGeometry(0.1, 12, 12);
    addMesh(fistGeo, materials['brz'], 0, -0.56, 0, armLGroup, 'Fist_L');
    addMesh(fistGeo, materials['brz'], 0, -0.56, 0, armRGroup, 'Fist_R');

    root.updateMatrixWorld(true);
    return root;
}

function generateMTLContent() {
    return `# Wavefront Material Template File (.mtl)
# Robot Volt Materials (from Robo-Colores / Secuenciador 3D)

newmtl mat_torso_cyan
Ka 0.000 0.898 1.000
Kd 0.000 0.898 1.000
Ks 0.500 0.500 0.500
Ns 60.0
d 1.0
illum 2

newmtl mat_head_green
Ka 0.000 0.784 0.325
Kd 0.000 0.784 0.325
Ks 0.500 0.500 0.500
Ns 60.0
d 1.0
illum 2

newmtl mat_arms_purple
Ka 0.667 0.000 1.000
Kd 0.667 0.000 1.000
Ks 0.500 0.500 0.500
Ns 60.0
d 1.0
illum 2

newmtl mat_belly_yellow
Ka 1.000 0.839 0.000
Kd 1.000 0.839 0.000
Ks 0.500 0.500 0.500
Ns 60.0
d 1.0
illum 2

newmtl mat_legs_orange
Ka 1.000 0.427 0.000
Kd 1.000 0.427 0.000
Ks 0.500 0.500 0.500
Ns 60.0
d 1.0
illum 2

newmtl mat_core_red
Ka 1.000 0.090 0.267
Kd 1.000 0.090 0.267
Ks 0.500 0.500 0.500
Ns 60.0
d 1.0
illum 2

newmtl mat_antenna_magenta
Ka 0.961 0.000 0.341
Kd 0.961 0.000 0.341
Ks 0.500 0.500 0.500
Ns 60.0
d 1.0
illum 2

newmtl mat_dark_trim
Ka 0.086 0.098 0.141
Kd 0.086 0.098 0.141
Ks 0.400 0.400 0.400
Ns 40.0
d 1.0
illum 2

newmtl mat_eyes_cyan
Ka 0.000 0.898 1.000
Kd 0.000 0.898 1.000
Ks 1.000 1.000 1.000
Ke 0.000 0.898 1.000
Ns 100.0
d 1.0
illum 2

newmtl mat_base_metal
Ka 0.141 0.165 0.243
Kd 0.141 0.165 0.243
Ks 0.500 0.500 0.500
Ns 50.0
d 1.0
illum 2
`;
}

function exportModel() {
    const exporter = new OBJExporter();
    const robot = createVoltRobot(true);
    let objData = exporter.parse(robot);

    // Prepend mtllib reference and header comment
    const header = `# Robot Volt 3D Model (.obj)
# Original Mascot Character from Robo-Colores / RoboLane / Secuenciador 3D
# Programmatically created with Three.js geometries
mtllib volt.mtl

`;
    objData = header + objData;

    const mtlData = generateMTLContent();

    // Paths
    const rootDir = path.resolve(__dirname, '..');
    const modelsDir = path.join(rootDir, 'assets', 'models');
    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
    }

    // Save in assets/models/
    fs.writeFileSync(path.join(modelsDir, 'volt.obj'), objData, 'utf8');
    fs.writeFileSync(path.join(modelsDir, 'volt.mtl'), mtlData, 'utf8');

    // Also save in workspace root for convenient access
    fs.writeFileSync(path.join(rootDir, 'volt.obj'), objData, 'utf8');
    fs.writeFileSync(path.join(rootDir, 'volt.mtl'), mtlData, 'utf8');

    console.log('Successfully exported:');
    console.log('- ' + path.join(modelsDir, 'volt.obj'));
    console.log('- ' + path.join(modelsDir, 'volt.mtl'));
    console.log('- ' + path.join(rootDir, 'volt.obj'));
    console.log('- ' + path.join(rootDir, 'volt.mtl'));
}

exportModel();
