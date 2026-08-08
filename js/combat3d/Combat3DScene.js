/**
 * Combat3DScene - 3D Scene Builder for Three Kingdoms Battlefield
 * Sets up lighting, ground plane, environment, and visually distinct 3D character models (Guan Yu & Lu Bu).
 */
class Combat3DScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1117);
    this.scene.fog = new THREE.FogExp2(0x0e1117, 0.035);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth || 800, container.clientHeight || 450);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.initLights();
    this.initEnvironment();
    this.initCharacters();
  }

  initLights() {
    // Soft Ambient Light
    const ambient = new THREE.AmbientLight(0xfff5ea, 0.65);
    this.scene.add(ambient);

    // Warm Directional Sunlight with Shadows
    const sunLight = new THREE.DirectionalLight(0xffdfb3, 1.25);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    this.scene.add(sunLight);

    // Cool Rim Light for Hero Highlights
    const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.45);
    rimLight.position.set(-6, 6, -8);
    this.scene.add(rimLight);
  }

  initEnvironment() {
    // Ancient Battlefield Ground Platform (Low-poly Dirt / Stone Platform)
    const groundGeo = new THREE.CylinderGeometry(6.5, 7.2, 0.6, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3d3228,
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, -0.3, 0);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Decorative Gold Arena Circle Marker
    const ringGeo = new THREE.RingGeometry(5.8, 6.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.01, 0);
    this.scene.add(ring);

    // Tactical Battlefield Grid Lines
    const gridHelper = new THREE.GridHelper(12, 12, 0xd4af37, 0x2a241e);
    gridHelper.position.y = 0.02;
    gridHelper.material.opacity = 0.22;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  initCharacters() {
    this.setupCharacters('guanYu', 'luBu');
  }

  /**
   * Dynamically setup 3D characters for Player (Left) and Enemy (Right)
   * @param {string} p1CharacterId 
   * @param {string} p2CharacterId 
   */
  setupCharacters(p1CharacterId = 'guanYu', p2CharacterId = 'luBu') {
    // Remove old character groups if present
    if (this.p1Group) this.scene.remove(this.p1Group);
    if (this.p2Group) this.scene.remove(this.p2Group);

    this.p1CharacterId = p1CharacterId;
    this.p2CharacterId = p2CharacterId;

    this.p1Group = this.buildCharacterMesh(p1CharacterId, 'p1');
    this.p2Group = this.buildCharacterMesh(p2CharacterId, 'p2');

    this.scene.add(this.p1Group);
    this.scene.add(this.p2Group);

    // Backwards-compatible aliases for animator shortcuts
    this.guanYuGroup = (p1CharacterId === 'guanYu') ? this.p1Group : ((p2CharacterId === 'guanYu') ? this.p2Group : this.p1Group);
    this.luBuGroup = (p2CharacterId === 'luBu') ? this.p2Group : ((p1CharacterId === 'luBu') ? this.p1Group : this.p2Group);
  }

  /**
   * Build character mesh for a given character ID and side ('p1' = Left x=-3.2, 'p2' = Right x=3.2)
   * @param {string} characterId 
   * @param {string} side - 'p1' | 'p2'
   * @returns {THREE.Group}
   */
  buildCharacterMesh(characterId, side = 'p1') {
    // Resolve config from CharacterRegistry (falls back gracefully for unknown/unmodeled characters)
    const config = window.CharacterRegistry
      ? window.CharacterRegistry.get3DConfig(characterId)
      : { modelKey: characterId, has3DModel: false };

    const modelKey = (config && config.modelKey) ? config.modelKey : 'guanYu';
    const isFallback = !!(config && config.isFallback);
    const has3DModel = !!(config && config.has3DModel);

    // -----------------------------------------------------------------------
    // Mesh Dispatch Table — add new characters here as their models are built.
    // Maps modelKey → builder function (no arguments, returns THREE.Group).
    // -----------------------------------------------------------------------
    const meshBuilders = {
      'guanYu':               () => this.buildGuanYuMesh(),
      'luBu':                 () => this.buildLuBuMesh(),
      'liuBei':               () => this.buildLiuBeiMesh(),
      'caoCao':               () => this.buildCaoCaoMesh(),
      'xiahouDun':            () => this.buildXiahouDunMesh(),
      'banditLeader':         () => this.buildBanditLeaderMesh(),
      'mountainBanditLeader': () => this.buildMountainBanditLeaderMesh(),
      'yellowTurbanCommander':() => this.buildYellowTurbanCommanderMesh(),
      'dongZhuoVanguard':     () => this.buildDongZhuoVanguardMesh()
    };

    let group;
    if (!isFallback && has3DModel && meshBuilders[modelKey]) {
      // Use the real 3D model for this character
      group = meshBuilders[modelKey]();
    } else {
      // No real 3D model yet → generic placeholder warrior
      group = this.buildPlaceholderMesh(config ? (config.name || characterId) : characterId);
    }

    // Position & Orientation exclusively set here for both sides:
    //   P1 (Player) = Left  → x = -3.2, facing right (rotY = +π/2)
    //   P2 (Enemy)  = Right → x = +3.2, facing left  (rotY = -π/2)
    const posX = (side === 'p1') ? -3.2 : 3.2;
    const rotY = (side === 'p1') ? Math.PI / 2 : -Math.PI / 2;
    group.position.set(posX, 0, 0);
    group.rotation.y = rotY;

    // Attach visual placeholder badge above head if character lacks a real 3D model
    if (isFallback || !has3DModel) {
      const badgeName = config ? (config.name || characterId) : characterId;
      const badge = this.createPlaceholderBadge(badgeName);
      group.add(badge);
    }

    return group;
  }

  /**
   * Create a 3D Sprite badge to visually indicate placeholder / unknown character
   * @param {string} name 
   * @returns {THREE.Sprite}
   */
  createPlaceholderBadge(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
    ctx.beginPath();
    ctx.arc(24, 32, 20, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.arc(232, 32, 20, (Math.PI * 3) / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`[Placeholder: ${name}]`, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.0, 0.5, 1);
    sprite.position.set(0, 3.4, 0);
    return sprite;
  }

  /**
   * Builds generic low-poly placeholder mesh for characters without a real 3D model yet
   * @param {string} name 
   * @returns {THREE.Group}
   */
  buildPlaceholderMesh(name) {
    const group = new THREE.Group();

    const armorMat = new THREE.MeshStandardMaterial({ color: 0x34495e, roughness: 0.5, metalness: 0.3 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
    const capeMat = new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.6 });

    // Torso
    const chestGeo = new THREE.BoxGeometry(0.7, 0.85, 0.48);
    const chest = new THREE.Mesh(chestGeo, armorMat);
    chest.position.y = 1.05;
    chest.castShadow = true;
    group.add(chest);

    // Gold Emblem
    const emblemGeo = new THREE.OctahedronGeometry(0.18, 0);
    const emblem = new THREE.Mesh(emblemGeo, goldMat);
    emblem.position.set(0, 1.15, 0.26);
    group.add(emblem);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.75;
    head.castShadow = true;
    group.add(head);

    // Helmet
    const helmetGeo = new THREE.ConeGeometry(0.26, 0.4, 6);
    const helmet = new THREE.Mesh(helmetGeo, goldMat);
    helmet.position.y = 2.05;
    group.add(helmet);

    // Cape
    const capeGeo = new THREE.BoxGeometry(0.75, 1.3, 0.08);
    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, 0.9, -0.26);
    group.add(cape);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8);
    const l1 = new THREE.Mesh(legGeo, armorMat);
    l1.position.set(-0.2, 0.35, 0);
    group.add(l1);

    const l2 = new THREE.Mesh(legGeo, armorMat);
    l2.position.set(0.2, 0.35, 0);
    group.add(l2);

    return group;
  }

  /**
   * Builds iconic Guan Yu low-poly 3D character mesh.
   * Returns a neutral-origin group — positioning is handled by buildCharacterMesh().
   */
  buildGuanYuMesh() {
    const group = new THREE.Group();
    // NOTE: No position/rotation set here — buildCharacterMesh() owns that.

    const greenMat = new THREE.MeshStandardMaterial({ color: 0x1e824c, roughness: 0.4 }); // Emerald Green Armor
    const darkGreenMat = new THREE.MeshStandardMaterial({ color: 0x145a32, roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 }); // Gold Trim
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
    const beardMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }); // Flowing Black Beard
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.8 });

    // 1. Torso & Chest Armor
    const chestGeo = new THREE.BoxGeometry(0.7, 0.85, 0.48);
    const chest = new THREE.Mesh(chestGeo, greenMat);
    chest.position.y = 1.05;
    chest.castShadow = true;
    group.add(chest);

    // Gold Chest Emblem / Plate
    const plateGeo = new THREE.BoxGeometry(0.32, 0.45, 0.5);
    const plate = new THREE.Mesh(plateGeo, goldMat);
    plate.position.y = 1.1;
    group.add(plate);

    // Leather Belt & Sash
    const beltGeo = new THREE.BoxGeometry(0.72, 0.14, 0.5);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x784212 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 0.65;
    group.add(belt);

    // Green Robe Skirt
    const skirtGeo = new THREE.CylinderGeometry(0.36, 0.44, 0.6, 8);
    const skirt = new THREE.Mesh(skirtGeo, darkGreenMat);
    skirt.position.y = 0.35;
    skirt.castShadow = true;
    group.add(skirt);

    // Shoulder Pauldrons (Left & Right)
    const pauldronGeo = new THREE.BoxGeometry(0.28, 0.28, 0.38);
    const pLeft = new THREE.Mesh(pauldronGeo, goldMat);
    pLeft.position.set(-0.44, 1.35, 0);
    pLeft.rotation.z = 0.3;
    group.add(pLeft);

    const pRight = new THREE.Mesh(pauldronGeo, goldMat);
    pRight.position.set(0.44, 1.35, 0);
    pRight.rotation.z = -0.3;
    group.add(pRight);

    // 2. Head, Helmet & Iconic Long Beard
    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.75;
    head.castShadow = true;
    group.add(head);

    // Guan Yu Traditional Green Cloth Wrap / Cap
    const capGeo = new THREE.ConeGeometry(0.26, 0.38, 8);
    const cap = new THREE.Mesh(capGeo, darkGreenMat);
    cap.position.set(0, 2.05, -0.02);
    cap.rotation.x = -0.15;
    group.add(cap);

    const capBandGeo = new THREE.TorusGeometry(0.24, 0.03, 8, 16);
    const capBand = new THREE.Mesh(capBandGeo, goldMat);
    capBand.position.set(0, 1.88, 0);
    capBand.rotation.x = Math.PI / 2;
    group.add(capBand);

    // ICONIC LONG BEARD SILHOUETTE
    const beardTopGeo = new THREE.ConeGeometry(0.12, 0.55, 8);
    const beardTop = new THREE.Mesh(beardTopGeo, beardMat);
    beardTop.position.set(0, 1.45, 0.22);
    beardTop.rotation.x = 0.2;
    beardTop.castShadow = true;
    group.add(beardTop);

    const beardBottomGeo = new THREE.ConeGeometry(0.08, 0.5, 6);
    const beardBottom = new THREE.Mesh(beardBottomGeo, beardMat);
    beardBottom.position.set(0, 1.1, 0.28);
    beardBottom.rotation.x = 0.15;
    group.add(beardBottom);

    // 3. Green Dragon Crescent Blade (Qinglong Yanyuedao)
    const shaftGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.8, 8);
    const shaft = new THREE.Mesh(shaftGeo, woodMat);
    shaft.position.set(0.42, 1.3, 0.2);
    shaft.rotation.z = -Math.PI / 14;
    shaft.castShadow = true;
    group.add(shaft);

    // Dragon Socket Guard
    const socketGeo = new THREE.BoxGeometry(0.14, 0.22, 0.14);
    const socket = new THREE.Mesh(socketGeo, goldMat);
    socket.position.set(0.48, 2.5, 0.2);
    group.add(socket);

    // Curved Crescent Blade
    const bladeCurveGeo = new THREE.CylinderGeometry(0.02, 0.25, 0.75, 4);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x2ecc71, metalness: 0.85, roughness: 0.15 });
    const blade = new THREE.Mesh(bladeCurveGeo, bladeMat);
    blade.position.set(0.55, 2.85, 0.2);
    blade.rotation.z = -Math.PI / 10;
    blade.castShadow = true;
    group.add(blade);

    // Blade Tip Spike
    const tipGeo = new THREE.ConeGeometry(0.06, 0.3, 4);
    const tip = new THREE.Mesh(tipGeo, goldMat);
    tip.position.set(0.58, 3.25, 0.2);
    group.add(tip);

    return group;
  }

  /**
   * Builds iconic Lu Bu low-poly 3D character mesh.
   * Returns a neutral-origin group — positioning is handled by buildCharacterMesh().
   */
  buildLuBuMesh() {
    const group = new THREE.Group();
    // NOTE: No position/rotation set here — buildCharacterMesh() owns that.

    const crimsonMat = new THREE.MeshStandardMaterial({ color: 0x800020, roughness: 0.3 }); // Dark Crimson Armor
    const blackSteelMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, metalness: 0.6, roughness: 0.4 }); // Dark Steel
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }); // Gold Trim
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfa066, roughness: 0.6 });
    const featherMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.5 }); // Crimson Pheasant Feathers
    const spearMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.8 });

    // 1. Torso & Heavy Armor
    const chestGeo = new THREE.BoxGeometry(0.76, 0.9, 0.5);
    const chest = new THREE.Mesh(chestGeo, crimsonMat);
    chest.position.y = 1.08;
    chest.castShadow = true;
    group.add(chest);

    // Black Steel Plate Inset
    const steelPlateGeo = new THREE.BoxGeometry(0.4, 0.6, 0.52);
    const steelPlate = new THREE.Mesh(steelPlateGeo, blackSteelMat);
    steelPlate.position.y = 1.1;
    group.add(steelPlate);

    // Gold Dragon Chest Ornament
    const ornamentGeo = new THREE.OctahedronGeometry(0.18, 0);
    const ornament = new THREE.Mesh(ornamentGeo, goldMat);
    ornament.position.set(0, 1.18, 0.27);
    group.add(ornament);

    // Studded Heavy Belt
    const beltGeo = new THREE.BoxGeometry(0.78, 0.16, 0.52);
    const belt = new THREE.Mesh(beltGeo, goldMat);
    belt.position.y = 0.66;
    group.add(belt);

    // Crimson Battle Skirt
    const skirtGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.62, 8);
    const skirt = new THREE.Mesh(skirtGeo, crimsonMat);
    skirt.position.y = 0.36;
    skirt.castShadow = true;
    group.add(skirt);

    // Heavy Spiked Shoulder Pauldrons
    const pauldronGeo = new THREE.ConeGeometry(0.24, 0.45, 5);
    const pLeft = new THREE.Mesh(pauldronGeo, goldMat);
    pLeft.position.set(-0.48, 1.42, 0);
    pLeft.rotation.z = Math.PI / 3;
    group.add(pLeft);

    const pRight = new THREE.Mesh(pauldronGeo, goldMat);
    pRight.position.set(0.48, 1.42, 0);
    pRight.rotation.z = -Math.PI / 3;
    group.add(pRight);

    // 2. Head, Warlord Helmet & Twin Pheasant Feathers (Lingzi)
    const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);

    // Warlord Helmet Crown
    const helmetGeo = new THREE.CylinderGeometry(0.2, 0.27, 0.3, 8);
    const helmet = new THREE.Mesh(helmetGeo, blackSteelMat);
    helmet.position.y = 2.0;
    group.add(helmet);

    const helmetSpikeGeo = new THREE.ConeGeometry(0.12, 0.35, 6);
    const helmetSpike = new THREE.Mesh(helmetSpikeGeo, goldMat);
    helmetSpike.position.y = 2.28;
    group.add(helmetSpike);

    // TWIN PHEASANT FEATHERS (LINGZI SILHOUETTE)
    // Left Feather
    const featherGeo = new THREE.CylinderGeometry(0.015, 0.035, 1.5, 6);
    const fLeft = new THREE.Mesh(featherGeo, featherMat);
    fLeft.position.set(0.12, 2.9, -0.05);
    fLeft.rotation.z = -0.3;
    fLeft.rotation.x = -0.2;
    fLeft.castShadow = true;
    group.add(fLeft);

    // Right Feather
    const fRight = new THREE.Mesh(featherGeo, featherMat);
    fRight.position.set(-0.12, 2.9, -0.05);
    fRight.rotation.z = 0.3;
    fRight.rotation.x = -0.2;
    fRight.castShadow = true;
    group.add(fRight);

    // 3. Sky Piercer Halberd (Fangtian Huaji)
    const shaftGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.9, 8);
    const shaft = new THREE.Mesh(shaftGeo, spearMat);
    shaft.position.set(0.45, 1.35, 0.2);
    shaft.rotation.z = Math.PI / 14;
    shaft.castShadow = true;
    group.add(shaft);

    // Spear Head Center Tip
    const spearTipGeo = new THREE.ConeGeometry(0.08, 0.65, 4);
    const spearTip = new THREE.Mesh(spearTipGeo, goldMat);
    spearTip.position.set(0.38, 2.85, 0.2);
    spearTip.castShadow = true;
    group.add(spearTip);

    // Crescent Wing Blades (Left & Right of spear point)
    const wingGeo = new THREE.BoxGeometry(0.24, 0.38, 0.04);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, metalness: 0.9, roughness: 0.1 });
    const wingLeft = new THREE.Mesh(wingGeo, wingMat);
    wingLeft.position.set(0.24, 2.65, 0.2);
    wingLeft.rotation.z = 0.2;
    group.add(wingLeft);

    const wingRight = new THREE.Mesh(wingGeo, wingMat);
    wingRight.position.set(0.52, 2.65, 0.2);
    wingRight.rotation.z = -0.2;
    group.add(wingRight);

    return group;
  }

  /**
   * Liu Bei — Royal Blue robe, benevolent general, twin swords at waist.
   * Neutral-origin group — positioning handled by buildCharacterMesh().
   */
  buildLiuBeiMesh() {
    const group = new THREE.Group();

    const robeMat  = new THREE.MeshStandardMaterial({ color: 0x1a4a8a, roughness: 0.5 });  // Royal Blue
    const darkMat  = new THREE.MeshStandardMaterial({ color: 0x0d2b55, roughness: 0.6 });
    const goldMat  = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 });
    const skinMat  = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
    const swordMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, metalness: 0.9, roughness: 0.1 });

    // Torso — wide robe silhouette
    const chestGeo = new THREE.BoxGeometry(0.72, 0.9, 0.5);
    const chest = new THREE.Mesh(chestGeo, robeMat);
    chest.position.y = 1.05; chest.castShadow = true;
    group.add(chest);

    // Gold sash across chest
    const sashGeo = new THREE.BoxGeometry(0.74, 0.12, 0.52);
    const sash = new THREE.Mesh(sashGeo, goldMat);
    sash.position.y = 0.78;
    group.add(sash);

    // Long flowing robe skirt
    const skirtGeo = new THREE.CylinderGeometry(0.38, 0.52, 0.75, 8);
    const skirt = new THREE.Mesh(skirtGeo, darkMat);
    skirt.position.y = 0.37; skirt.castShadow = true;
    group.add(skirt);

    // Rounded shoulder drapes
    const drapeGeo = new THREE.BoxGeometry(0.3, 0.22, 0.42);
    const drapeL = new THREE.Mesh(drapeGeo, goldMat);
    drapeL.position.set(-0.46, 1.32, 0); drapeL.rotation.z = 0.2;
    group.add(drapeL);
    const drapeR = new THREE.Mesh(drapeGeo, goldMat);
    drapeR.position.set(0.46, 1.32, 0); drapeR.rotation.z = -0.2;
    group.add(drapeR);

    // Head — kind scholarly face
    const headGeo = new THREE.SphereGeometry(0.23, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.76; head.castShadow = true;
    group.add(head);

    // Scholar’s tall cloth crown (guan mao)
    const crownBaseGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.18, 8);
    const crownBase = new THREE.Mesh(crownBaseGeo, darkMat);
    crownBase.position.y = 1.98;
    group.add(crownBase);
    const crownTopGeo = new THREE.BoxGeometry(0.16, 0.38, 0.18);
    const crownTop = new THREE.Mesh(crownTopGeo, darkMat);
    crownTop.position.y = 2.26;
    group.add(crownTop);
    const crownRimGeo = new THREE.TorusGeometry(0.22, 0.025, 6, 12);
    const crownRim = new THREE.Mesh(crownRimGeo, goldMat);
    crownRim.position.y = 1.95; crownRim.rotation.x = Math.PI / 2;
    group.add(crownRim);

    // Twin straight swords at waist
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.75, 0.06);
    const swordL = new THREE.Mesh(bladeGeo, swordMat);
    swordL.position.set(-0.38, 0.72, 0.22); swordL.rotation.z = -0.1;
    group.add(swordL);
    const swordR = new THREE.Mesh(bladeGeo, swordMat);
    swordR.position.set(0.38, 0.72, 0.22); swordR.rotation.z = 0.1;
    group.add(swordR);

    return group;
  }

  /**
   * Cao Cao — Dark steel strategist armor, stern warlord silhouette, elegant jian sword.
   * Neutral-origin group — positioning handled by buildCharacterMesh().
   */
  buildCaoCaoMesh() {
    const group = new THREE.Group();

    const steelMat  = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.7, roughness: 0.35 }); // Dark Steel
    const silverMat = new THREE.MeshStandardMaterial({ color: 0x808b96, metalness: 0.85, roughness: 0.2 });
    const goldMat   = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.25 });
    const skinMat   = new THREE.MeshStandardMaterial({ color: 0xdfa066, roughness: 0.6 });
    const swordMat  = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.95, roughness: 0.08 });

    // Chest — broad warlord torso
    const chestGeo = new THREE.BoxGeometry(0.74, 0.88, 0.5);
    const chest = new THREE.Mesh(chestGeo, steelMat);
    chest.position.y = 1.06; chest.castShadow = true;
    group.add(chest);

    // Layered steel plate across chest
    const plateGeo = new THREE.BoxGeometry(0.52, 0.55, 0.52);
    const plate = new THREE.Mesh(plateGeo, silverMat);
    plate.position.y = 1.1;
    group.add(plate);

    // Gold dragon chest emblem
    const emblemGeo = new THREE.OctahedronGeometry(0.16, 0);
    const emblem = new THREE.Mesh(emblemGeo, goldMat);
    emblem.position.set(0, 1.18, 0.27);
    group.add(emblem);

    // Studded belt
    const beltGeo = new THREE.BoxGeometry(0.76, 0.15, 0.52);
    const belt = new THREE.Mesh(beltGeo, goldMat);
    belt.position.y = 0.66;
    group.add(belt);

    // Steel skirt
    const skirtGeo = new THREE.CylinderGeometry(0.36, 0.45, 0.65, 8);
    const skirt = new THREE.Mesh(skirtGeo, steelMat);
    skirt.position.y = 0.35; skirt.castShadow = true;
    group.add(skirt);

    // Angular spiked pauldrons
    const pauldronGeo = new THREE.ConeGeometry(0.2, 0.42, 4);
    const pL = new THREE.Mesh(pauldronGeo, silverMat);
    pL.position.set(-0.47, 1.38, 0); pL.rotation.z = Math.PI / 3;
    group.add(pL);
    const pR = new THREE.Mesh(pauldronGeo, silverMat);
    pR.position.set(0.47, 1.38, 0); pR.rotation.z = -Math.PI / 3;
    group.add(pR);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.77; head.castShadow = true;
    group.add(head);

    // Full war helmet with face guard
    const helmetGeo = new THREE.CylinderGeometry(0.22, 0.27, 0.32, 8);
    const helmet = new THREE.Mesh(helmetGeo, steelMat);
    helmet.position.y = 2.01;
    group.add(helmet);
    const helmetSpikeGeo = new THREE.ConeGeometry(0.1, 0.3, 6);
    const spike = new THREE.Mesh(helmetSpikeGeo, goldMat);
    spike.position.y = 2.3;
    group.add(spike);
    // Brow guard
    const browGeo = new THREE.BoxGeometry(0.5, 0.07, 0.12);
    const brow = new THREE.Mesh(browGeo, silverMat);
    brow.position.set(0, 1.87, 0.22);
    group.add(brow);

    // Elegant jian (straight sword) at side
    const shaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6);
    const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.8 }));
    shaft.position.set(0.44, 1.1, 0.18); shaft.rotation.z = -Math.PI / 18;
    group.add(shaft);
    const guardGeo = new THREE.BoxGeometry(0.28, 0.06, 0.08);
    const guard = new THREE.Mesh(guardGeo, goldMat);
    guard.position.set(0.45, 2.15, 0.18);
    group.add(guard);
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.82, 0.05);
    const blade = new THREE.Mesh(bladeGeo, swordMat);
    blade.position.set(0.46, 2.64, 0.18); blade.rotation.z = -0.06;
    group.add(blade);

    return group;
  }

  /**
   * Xiahou Dun — Fierce one-eyed general, dark iron armor, heavy halberd, eyepatch silhouette.
   * Neutral-origin group — positioning handled by buildCharacterMesh().
   */
  buildXiahouDunMesh() {
    const group = new THREE.Group();

    const ironMat   = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, metalness: 0.65, roughness: 0.45 }); // Near-Black Iron
    const crimsonMat= new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.4 });  // Dark Red accents
    const goldMat   = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.75, roughness: 0.3 });
    const skinMat   = new THREE.MeshStandardMaterial({ color: 0xdfa066, roughness: 0.6 });
    const halberdMat= new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.85, roughness: 0.15 });

    // Heavy barrel chest
    const chestGeo = new THREE.BoxGeometry(0.78, 0.92, 0.52);
    const chest = new THREE.Mesh(chestGeo, ironMat);
    chest.position.y = 1.06; chest.castShadow = true;
    group.add(chest);

    // Crimson cross-chest strap
    const strapGeo = new THREE.BoxGeometry(0.14, 1.1, 0.54);
    const strap = new THREE.Mesh(strapGeo, crimsonMat);
    strap.position.y = 1.05; strap.rotation.z = 0.3;
    group.add(strap);

    // Gold chest boss
    const bossGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const boss = new THREE.Mesh(bossGeo, goldMat);
    boss.position.set(0, 1.12, 0.28);
    group.add(boss);

    // Heavy belt
    const beltGeo = new THREE.BoxGeometry(0.8, 0.18, 0.54);
    const belt = new THREE.Mesh(beltGeo, ironMat);
    belt.position.y = 0.65;
    group.add(belt);

    // Iron skirt
    const skirtGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.65, 8);
    const skirt = new THREE.Mesh(skirtGeo, ironMat);
    skirt.position.y = 0.34; skirt.castShadow = true;
    group.add(skirt);

    // Massive spiked pauldrons
    const pauldronGeo = new THREE.BoxGeometry(0.32, 0.32, 0.44);
    const pL = new THREE.Mesh(pauldronGeo, ironMat);
    pL.position.set(-0.5, 1.4, 0);
    group.add(pL);
    const pR = new THREE.Mesh(pauldronGeo, ironMat);
    pR.position.set(0.5, 1.4, 0);
    group.add(pR);

    // Head — battle-scarred face
    const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.79; head.castShadow = true;
    group.add(head);

    // Dark iron war helmet
    const helmetGeo = new THREE.CylinderGeometry(0.21, 0.28, 0.28, 6);
    const helmet = new THREE.Mesh(helmetGeo, ironMat);
    helmet.position.y = 1.99;
    group.add(helmet);
    const helmetFringeGeo = new THREE.CylinderGeometry(0.28, 0.3, 0.1, 6);
    const fringe = new THREE.Mesh(helmetFringeGeo, crimsonMat);
    fringe.position.y = 1.87;
    group.add(fringe);
    // ICONIC EYEPATCH (left eye)
    const patchGeo = new THREE.CircleGeometry(0.07, 8);
    const patchMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const patch = new THREE.Mesh(patchGeo, patchMat);
    patch.position.set(-0.1, 1.8, 0.25);
    group.add(patch);

    // Long ji halberd
    const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.0, 8);
    const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.75 }));
    shaft.position.set(0.46, 1.3, 0.2); shaft.rotation.z = Math.PI / 18;
    group.add(shaft);
    const axeGeo = new THREE.BoxGeometry(0.38, 0.55, 0.05);
    const axe = new THREE.Mesh(axeGeo, halberdMat);
    axe.position.set(0.5, 2.85, 0.2); axe.rotation.z = -0.2;
    group.add(axe);
    const axeTipGeo = new THREE.ConeGeometry(0.07, 0.4, 4);
    const axeTip = new THREE.Mesh(axeTipGeo, goldMat);
    axeTip.position.set(0.48, 3.15, 0.2);
    group.add(axeTip);

    return group;
  }

  /**
   * Bandit Leader — Ragged brown leather, crude axe, scarred rogue.
   * Neutral-origin group — positioning handled by buildCharacterMesh().
   */
  buildBanditLeaderMesh() {
    const group = new THREE.Group();

    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.85 }); // Brown leather
    const ragMat     = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });  // Dirty tan rags
    const ironMat    = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.5, roughness: 0.6 });
    const skinMat    = new THREE.MeshStandardMaterial({ color: 0xc68642, roughness: 0.7 });

    // Broad rough chest
    const chestGeo = new THREE.BoxGeometry(0.74, 0.88, 0.5);
    const chest = new THREE.Mesh(chestGeo, leatherMat);
    chest.position.y = 1.04; chest.castShadow = true;
    group.add(chest);

    // Layered rags over leather
    const ragGeo = new THREE.BoxGeometry(0.76, 0.5, 0.52);
    const rag = new THREE.Mesh(ragGeo, ragMat);
    rag.position.y = 0.88;
    group.add(rag);

    // Crude belt with iron buckle
    const beltGeo = new THREE.BoxGeometry(0.78, 0.16, 0.52);
    const belt = new THREE.Mesh(beltGeo, ironMat);
    belt.position.y = 0.65;
    group.add(belt);

    // Skirt of torn cloth strips
    const skirtGeo = new THREE.CylinderGeometry(0.38, 0.46, 0.6, 8);
    const skirt = new THREE.Mesh(skirtGeo, ragMat);
    skirt.position.y = 0.35; skirt.castShadow = true;
    group.add(skirt);

    // Uneven shoulder guards
    const shoulGeo = new THREE.BoxGeometry(0.28, 0.22, 0.38);
    const shoulL = new THREE.Mesh(shoulGeo, leatherMat);
    shoulL.position.set(-0.46, 1.35, 0); shoulL.rotation.z = 0.25;
    group.add(shoulL);
    const shoulR = new THREE.Mesh(shoulGeo, ironMat); // mismatched
    shoulR.position.set(0.46, 1.35, 0); shoulR.rotation.z = -0.15;
    group.add(shoulR);

    // Head — rough-cut hair and scarred face
    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.77; head.castShadow = true;
    group.add(head);

    // Rough bandana / headwrap
    const bandanaGeo = new THREE.CylinderGeometry(0.245, 0.245, 0.12, 12);
    const bandana = new THREE.Mesh(bandanaGeo, ragMat);
    bandana.position.y = 1.82;
    group.add(bandana);

    // Broad crude battle-axe
    const handleGeo = new THREE.CylinderGeometry(0.032, 0.032, 2.2, 6);
    const handle = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.85 }));
    handle.position.set(0.43, 1.2, 0.2); handle.rotation.z = -Math.PI / 16;
    group.add(handle);
    const axeHeadGeo = new THREE.BoxGeometry(0.5, 0.44, 0.06);
    const axeHead = new THREE.Mesh(axeHeadGeo, ironMat);
    axeHead.position.set(0.5, 2.3, 0.2); axeHead.rotation.z = 0.15;
    group.add(axeHead);

    return group;
  }

  /**
   * Mountain Bandit Leader — Fur-lined brown armor, mountain clan sword, wilder build.
   * Neutral-origin group — positioning handled by buildCharacterMesh().
   */
  buildMountainBanditLeaderMesh() {
    const group = new THREE.Group();

    const furMat    = new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.95 });  // Dark fur brown
    const boneWhite = new THREE.MeshStandardMaterial({ color: 0xd6cca0, roughness: 0.8 });   // Bone/ivory accent
    const ironMat   = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.55, roughness: 0.55 });
    const skinMat   = new THREE.MeshStandardMaterial({ color: 0xb07040, roughness: 0.7 });

    // Wide fur-armored torso
    const chestGeo = new THREE.BoxGeometry(0.8, 0.95, 0.55);
    const chest = new THREE.Mesh(chestGeo, furMat);
    chest.position.y = 1.07; chest.castShadow = true;
    group.add(chest);

    // Bone necklace trophy
    const neckGeo = new THREE.TorusGeometry(0.18, 0.035, 6, 12);
    const neck = new THREE.Mesh(neckGeo, boneWhite);
    neck.position.set(0, 1.44, 0.24); neck.rotation.x = Math.PI / 2;
    group.add(neck);

    // Crude belt
    const beltGeo = new THREE.BoxGeometry(0.82, 0.18, 0.56);
    const belt = new THREE.Mesh(beltGeo, ironMat);
    belt.position.y = 0.64;
    group.add(belt);

    // Heavy fur skirt
    const skirtGeo = new THREE.CylinderGeometry(0.42, 0.54, 0.7, 8);
    const skirt = new THREE.Mesh(skirtGeo, furMat);
    skirt.position.y = 0.34; skirt.castShadow = true;
    group.add(skirt);

    // Large fur-draped shoulders (bigger silhouette)
    const shoulGeo = new THREE.BoxGeometry(0.36, 0.3, 0.5);
    const shoulL = new THREE.Mesh(shoulGeo, furMat);
    shoulL.position.set(-0.52, 1.42, 0);
    group.add(shoulL);
    const shoulR = new THREE.Mesh(shoulGeo, furMat);
    shoulR.position.set(0.52, 1.42, 0);
    group.add(shoulR);

    // Head — larger, bestial
    const headGeo = new THREE.SphereGeometry(0.27, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.82; head.castShadow = true;
    group.add(head);

    // Animal-hide hood with horns
    const hoodGeo = new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hood = new THREE.Mesh(hoodGeo, furMat);
    hood.position.y = 1.82;
    group.add(hood);
    const hornGeo = new THREE.ConeGeometry(0.05, 0.36, 6);
    const hornL = new THREE.Mesh(hornGeo, boneWhite);
    hornL.position.set(-0.2, 2.26, 0.04); hornL.rotation.z = -0.4;
    group.add(hornL);
    const hornR = new THREE.Mesh(hornGeo, boneWhite);
    hornR.position.set(0.2, 2.26, 0.04); hornR.rotation.z = 0.4;
    group.add(hornR);

    // Heavy curved dao sword
    const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6);
    const handle = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0x2b1d0e, roughness: 0.9 }));
    handle.position.set(0.44, 1.25, 0.2); handle.rotation.z = -Math.PI / 14;
    group.add(handle);
    const daoGeo = new THREE.BoxGeometry(0.08, 0.82, 0.05);
    const dao = new THREE.Mesh(daoGeo, ironMat);
    dao.position.set(0.52, 2.45, 0.2); dao.rotation.z = -0.25;
    group.add(dao);

    return group;
  }

  /**
   * Yellow Turban Commander — Yellow armored officer, yellow banner-cloth, iron dao.
   * Neutral-origin group — positioning handled by buildCharacterMesh().
   */
  buildYellowTurbanCommanderMesh() {
    const group = new THREE.Group();

    const yellowMat  = new THREE.MeshStandardMaterial({ color: 0xd4a800, roughness: 0.5 }); // Deep yellow
    const darkYellow = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.6 });
    const ironMat    = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, metalness: 0.55, roughness: 0.5 });
    const skinMat    = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.6 });
    const clothMat   = new THREE.MeshStandardMaterial({ color: 0xf0c020, roughness: 0.7 }); // Bright yellow cloth

    // Commander chest plate
    const chestGeo = new THREE.BoxGeometry(0.74, 0.9, 0.52);
    const chest = new THREE.Mesh(chestGeo, ironMat);
    chest.position.y = 1.06; chest.castShadow = true;
    group.add(chest);

    // Yellow robe overlay
    const robeGeo = new THREE.BoxGeometry(0.72, 0.55, 0.54);
    const robe = new THREE.Mesh(robeGeo, yellowMat);
    robe.position.y = 1.16;
    group.add(robe);

    // Wide shoulder flags (Taoist banner strips)
    const flagGeo = new THREE.BoxGeometry(0.28, 0.6, 0.06);
    const flagL = new THREE.Mesh(flagGeo, clothMat);
    flagL.position.set(-0.48, 1.2, 0.04);
    group.add(flagL);
    const flagR = new THREE.Mesh(flagGeo, clothMat);
    flagR.position.set(0.48, 1.2, 0.04);
    group.add(flagR);

    // Belt
    const beltGeo = new THREE.BoxGeometry(0.76, 0.15, 0.54);
    const belt = new THREE.Mesh(beltGeo, darkYellow);
    belt.position.y = 0.66;
    group.add(belt);

    // Yellow cloth skirt
    const skirtGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.65, 8);
    const skirt = new THREE.Mesh(skirtGeo, yellowMat);
    skirt.position.y = 0.35; skirt.castShadow = true;
    group.add(skirt);

    // Iron pauldrons
    const pauldronGeo = new THREE.BoxGeometry(0.26, 0.26, 0.4);
    const pL = new THREE.Mesh(pauldronGeo, ironMat);
    pL.position.set(-0.46, 1.36, 0);
    group.add(pL);
    const pR = new THREE.Mesh(pauldronGeo, ironMat);
    pR.position.set(0.46, 1.36, 0);
    group.add(pR);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.77; head.castShadow = true;
    group.add(head);

    // ICONIC YELLOW TURBAN headwrap
    const turbanGeo = new THREE.CylinderGeometry(0.25, 0.27, 0.24, 12);
    const turban = new THREE.Mesh(turbanGeo, clothMat);
    turban.position.y = 1.9;
    group.add(turban);
    const knotGeo = new THREE.BoxGeometry(0.14, 0.14, 0.22);
    const knot = new THREE.Mesh(knotGeo, clothMat);
    knot.position.set(0, 2.05, -0.24);
    group.add(knot);

    // Iron dao sword
    const handleGeo = new THREE.CylinderGeometry(0.028, 0.028, 2.1, 6);
    const handle = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0x3d2010, roughness: 0.85 }));
    handle.position.set(0.44, 1.1, 0.2); handle.rotation.z = -Math.PI / 18;
    group.add(handle);
    const daoGeo = new THREE.BoxGeometry(0.06, 0.78, 0.05);
    const dao = new THREE.Mesh(daoGeo, ironMat);
    dao.position.set(0.46, 2.25, 0.2); dao.rotation.z = -0.08;
    group.add(dao);

    return group;
  }

  /**
   * Dong Zhuo Vanguard — Heavy crimson+black war-bruiser, curved great-sword, imposing silhouette.
   * Neutral-origin group — positioning handled by buildCharacterMesh().
   */
  buildDongZhuoVanguardMesh() {
    const group = new THREE.Group();

    const warMat    = new THREE.MeshStandardMaterial({ color: 0x4a0808, roughness: 0.45 }); // Deep blood-red
    const blackMat  = new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0.65, roughness: 0.4 });
    const goldMat   = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.25 });
    const skinMat   = new THREE.MeshStandardMaterial({ color: 0xc07040, roughness: 0.65 });
    const bladeMat  = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, metalness: 0.9, roughness: 0.1 });

    // Massive broad chest (biggest build)
    const chestGeo = new THREE.BoxGeometry(0.88, 1.0, 0.58);
    const chest = new THREE.Mesh(chestGeo, warMat);
    chest.position.y = 1.08; chest.castShadow = true;
    group.add(chest);

    // Black steel front plate
    const plateGeo = new THREE.BoxGeometry(0.56, 0.7, 0.6);
    const plate = new THREE.Mesh(plateGeo, blackMat);
    plate.position.y = 1.1;
    group.add(plate);

    // Gold studs across chest
    for (var si = -1; si <= 1; si += 2) {
      const studGeo = new THREE.SphereGeometry(0.055, 6, 6);
      const stud = new THREE.Mesh(studGeo, goldMat);
      stud.position.set(si * 0.22, 1.18, 0.31);
      group.add(stud);
    }

    // Thick belt
    const beltGeo = new THREE.BoxGeometry(0.9, 0.2, 0.6);
    const belt = new THREE.Mesh(beltGeo, blackMat);
    belt.position.y = 0.64;
    group.add(belt);

    // Heavy armored skirt
    const skirtGeo = new THREE.CylinderGeometry(0.44, 0.56, 0.7, 8);
    const skirt = new THREE.Mesh(skirtGeo, warMat);
    skirt.position.y = 0.33; skirt.castShadow = true;
    group.add(skirt);

    // Huge angular pauldrons
    const pauldronGeo = new THREE.BoxGeometry(0.38, 0.38, 0.5);
    const pL = new THREE.Mesh(pauldronGeo, blackMat);
    pL.position.set(-0.56, 1.44, 0);
    group.add(pL);
    const pR = new THREE.Mesh(pauldronGeo, blackMat);
    pR.position.set(0.56, 1.44, 0);
    group.add(pR);
    // Spiked tops
    const spikeGeo = new THREE.ConeGeometry(0.07, 0.3, 4);
    const spikeL = new THREE.Mesh(spikeGeo, goldMat);
    spikeL.position.set(-0.56, 1.76, 0);
    group.add(spikeL);
    const spikeR = new THREE.Mesh(spikeGeo, goldMat);
    spikeR.position.set(0.56, 1.76, 0);
    group.add(spikeR);

    // Big scarred head
    const headGeo = new THREE.SphereGeometry(0.27, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.83; head.castShadow = true;
    group.add(head);

    // Full-face black iron helmet with gold crest
    const helmetGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.34, 8);
    const helmet = new THREE.Mesh(helmetGeo, blackMat);
    helmet.position.y = 2.03;
    group.add(helmet);
    const crestGeo = new THREE.BoxGeometry(0.08, 0.38, 0.04);
    const crest = new THREE.Mesh(crestGeo, goldMat);
    crest.position.set(0, 2.3, 0.02);
    group.add(crest);
    // Face guard
    const guardGeo = new THREE.BoxGeometry(0.46, 0.18, 0.08);
    const faceGuard = new THREE.Mesh(guardGeo, blackMat);
    faceGuard.position.set(0, 1.88, 0.24);
    group.add(faceGuard);

    // Huge heavy great-sword (nodachi style)
    const bladeHandleGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.6, 6);
    const bladeHandle = new THREE.Mesh(bladeHandleGeo, new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.9 }));
    bladeHandle.position.set(0.46, 0.7, 0.22); bladeHandle.rotation.z = Math.PI / 20;
    group.add(bladeHandle);
    const bladeGuardGeo = new THREE.BoxGeometry(0.36, 0.08, 0.1);
    const bladeGuard = new THREE.Mesh(bladeGuardGeo, goldMat);
    bladeGuard.position.set(0.48, 1.54, 0.22);
    group.add(bladeGuard);
    const greatBladeGeo = new THREE.BoxGeometry(0.1, 1.4, 0.06);
    const greatBlade = new THREE.Mesh(greatBladeGeo, bladeMat);
    greatBlade.position.set(0.48, 2.32, 0.22); greatBlade.rotation.z = 0.06;
    group.add(greatBlade);
    const bladeTipGeo = new THREE.ConeGeometry(0.06, 0.32, 4);
    const bladeTip = new THREE.Mesh(bladeTipGeo, bladeMat);
    bladeTip.position.set(0.5, 3.06, 0.22);
    group.add(bladeTip);

    return group;
  }

  resize(width, height) {
    if (!height || height === 0) return;
    this.renderer.setSize(width, height);
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }
}

window.Combat3DScene = Combat3DScene;
